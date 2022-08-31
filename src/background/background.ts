import { isBrowserURL } from "../common/common";
import {
  Commands,
  Message,
  MessagePlayload,
  TogglePinTabPayload,
  ToggleMuteTabPayload,
  ChangeTabPayload,
  GivenTabPayload,
} from "../common/types";
import {
  checkCommands,
  getCurrentTab,
  getTabsInBrowser,
  injectExtension,
  reactOnTabUpdate,
} from "./utils";
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(({ reason }) => {
  console.log(reason);
  if (reason === "install" || reason === "update") {
    // opening the welcome page first buys the extension time to inject into the avalible pages
    if (reason === "install") {
      // uninstall survey
      browser.runtime.setUninstallURL("https://forms.gle/Eqi9Hgs86hSVrvT57");
      // const isMissingCommands = await checkCommands();
      checkCommands().then((isMissingCommands) => {
        const welcomeUrl = new URL("https://tabbutler.netlify.app/welcome");
        if (isMissingCommands) {
          // if there are missing/unbound commands, set a query param to show on the welcome page
          welcomeUrl.searchParams.set("missing_commands", "true");
        }
        browser.tabs.create({ url: welcomeUrl.toString() });
      });
    }
    injectExtension();
  }
});

browser.commands.onCommand.addListener((command) => {
  // should I make these async?
  getCurrentTab().then((currentTab) => {
    if (
      currentTab?.id &&
      currentTab.url &&
      // chrome does not like content scripts acting on thier urls
      !isBrowserURL(currentTab.url)
    ) {
      const messagePayload: MessagePlayload = {
        message:
          command === Commands.TOGGLE_TAB_ACTIONS
            ? Message.TOGGLE_TAB_ACTIONS
            : Message.TOGGLE_TAB_SEARCH, // basically fall back to the search
      };
      browser.tabs.sendMessage(currentTab.id, messagePayload);
    }
  }); // handle error
});

// SHOULD ONLY SEND UPDATED TAB DATA IF A TAB IN THE SAME WINDOW AS THE OPEN SEARCH IS CLOSED

browser.tabs.onRemoved.addListener((removedTabId) => {
  reactOnTabUpdate(removedTabId);
});
browser.tabs.onCreated.addListener(() => {
  reactOnTabUpdate();
});
// removed if statement as I also need to know when some of the fields are absent (like audible)
browser.tabs.onUpdated.addListener(() => {
  reactOnTabUpdate();
});

browser.runtime.onMessage.addListener(
  (messagePayload: MessagePlayload, sender) => {
    // should I be relying on the sender.tab?
    // should be present if the sender is a content script (would equate to the current tab)
    // https://developer.chrome.com/docs/extensions/reference/runtime/#type-MessageSender
    switch (messagePayload.message) {
      case Message.GET_TAB_DATA:
        return Promise.resolve(getTabsInBrowser());

      case Message.CHANGE_TAB: {
        const { tabId, windowId } = messagePayload as ChangeTabPayload;
        browser.windows.update(windowId, { focused: true }).then(() => {
          browser.tabs.update(tabId, {
            active: true,
          });
        });
        break;
      }

      case Message.CLOSE_CURRENT_TAB:
        // if not throw error?
        if (sender.tab?.id) {
          browser.tabs.remove(sender.tab.id);
        }
        break;
      case Message.CLOSE_CURRENT_WINDOW:
        if (sender.tab?.windowId) {
          browser.windows.remove(sender.tab.windowId);
        }
        break;

      case Message.CLOSE_GIVEN_TAB: {
        const { tabId } = messagePayload as GivenTabPayload;
        browser.tabs.remove(tabId);
        break;
      }
      case Message.OPEN_NEW_TAB:
        browser.tabs.create({ active: true });
        break;

      case Message.OPEN_NEW_WINDOW:
      case Message.OPEN_INCOGNITO_WINDOW:
        browser.windows.create({
          focused: true,
          incognito: messagePayload.message === Message.OPEN_INCOGNITO_WINDOW,
        });
        break;
      case Message.TOGGLE_PIN_GIVEN_TAB: {
        // toggle pinned for given tab
        const { tabId: giventabId, isPinned } =
          messagePayload as TogglePinTabPayload;
        browser.tabs.update(giventabId, { pinned: !isPinned });
        break;
      }
      case Message.TOGGLE_MUTE_GIVEN_TAB: {
        // toggle mute for given tab
        const { tabId: giventabId, isMuted } =
          messagePayload as ToggleMuteTabPayload;
        browser.tabs.update(giventabId, { muted: !isMuted });
        break;
      }
      case Message.TOGGLE_PIN_CURRENT_TAB:
        // toggle pinned for current tab
        if (sender.tab?.id) {
          const tabId = sender.tab.id;
          const currentPinnedSatus = sender.tab.pinned;
          browser.tabs.update(tabId, { pinned: !currentPinnedSatus });
        }
        break;
      case Message.TOGGLE_MUTE_CURRENT_TAB:
        // toggle muted for current tab
        if (sender.tab?.id && sender.tab.mutedInfo) {
          const tabId = sender.tab.id;
          const currentMutedStatus = sender.tab.mutedInfo.muted;
          browser.tabs.update(tabId, { muted: !currentMutedStatus });
        }
        break;
      case Message.DUPLICATE_TAB:
        if (sender.tab?.id) {
          browser.tabs.duplicate(sender.tab.id);
        }
        break;

      case Message.CLOSE_DUPLICATE_TABS: {
        browser.tabs.query({}).then((tabs) => {
          const uniqueURLs = new Set<string>();
          const duplicateTabIds: number[] = []; // should i use a set?
          for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            if (tab.url && tab.id) {
              const isDuplicateTab = uniqueURLs.has(tab.url);
              uniqueURLs.add(tab.url); // record that a tab with this specific url already exists
              if (isDuplicateTab) {
                duplicateTabIds.push(tab.id); // is a duplicate tab
              }
            }
          }
          // remove all duplicate tabs
          browser.tabs.remove(duplicateTabIds);
        });
        break;
      }

      case Message.CLOSE_OTHER_TABS: {
        if (sender.tab?.id && sender.tab?.windowId) {
          browser.tabs.query({ windowId: sender.tab.windowId }).then((tabs) => {
            const tabsToClose: number[] = [];
            for (let i = 0; i < tabs.length; i++) {
              const tab = tabs[i];
              if (tab.id && tab.id !== sender.tab?.id) {
                // get all other tabs
                tabsToClose.push(tab.id);
              }
            }
            // remove all other tabs
            browser.tabs.remove(tabsToClose);
          });
        }

        break;
      }
      case Message.OPEN_GITHUB:
      case Message.OPEN_GOOGLE:
      case Message.OPEN_TWITTER:
      case Message.OPEN_YOUTUBE:
      case Message.OPEN_FACEBOOK: {
        const url = getUrl(messagePayload.message);
        browser.tabs.create({ active: true, url });
        break;
      }
    }
  },
);

const getUrl = (message: Message) => {
  switch (message) {
    case Message.OPEN_GITHUB:
      return "https://www.github.com/";
    case Message.OPEN_GOOGLE:
      return "https://www.google.com/";
    case Message.OPEN_TWITTER:
      return "https://www.twitter.com/";
    case Message.OPEN_YOUTUBE:
      return "https://www.youtube.com/";
    case Message.OPEN_FACEBOOK:
      return "https://www.facebook.com/";
  }
};
