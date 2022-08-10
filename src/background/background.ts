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

browser.runtime.onInstalled.addListener(async ({ reason }) => {
  // should this be async?
  // should I do this on update?
  if (reason === "install" || reason === "update") {
    // uninstall survey
    // injectig on update might clash with already installed content script.
    // inject extension
    // open the welcome page
    // opening the welcome page first buys the extension time to inject into the avalible pages
    if (reason === "install") {
      browser.runtime.setUninstallURL("https://forms.gle/Eqi9Hgs86hSVrvT57");
      const isMissingCommands = await checkCommands();
      const welcomeUrl = new URL("https://tabbutler.netlify.app/welcome");
      if (isMissingCommands) {
        // if there are missing/unbound commands, set a query param to show on the welcome page
        welcomeUrl.searchParams.set("missing_commands", "true");
      }
      await browser.tabs.create({ url: welcomeUrl.toString() }); // not really nessecary to await
    }
    await injectExtension(); // not nessecary to await
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
      case Message.TOGGLE_PIN_TAB:
        // toggle pinned for current tab
        if (sender.tab?.id) {
          const tabId = sender.tab.id;
          const currentPinnedSatus = sender.tab.pinned;
          browser.tabs.update(tabId, { pinned: !currentPinnedSatus });
        }
        break;
      case Message.TOGGLE_MUTE_TAB:
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
      case Message.OPEN_DOWNLOADS:
      case Message.OPEN_EXTENSION:
      case Message.OPEN_SETTINGS:
      case Message.OPEN_HISTORY:
      case Message.OPEN_GITHUB:
      case Message.OPEN_GOOGLE:
      case Message.OPEN_TWITTER:
      case Message.OPEN_YOUTUBE:
      case Message.OPEN_FACEBOOK:
      case Message.OPEN_BOOKMARKS: {
        const url = getUrl(messagePayload.message);
        browser.tabs.create({ active: true, url });
        break;
      }
    }
  },
);

const getUrl = (message: Message) => {
  switch (message) {
    // these actions will need to be updated for firefox compatability
    case Message.OPEN_DOWNLOADS:
      return "chrome://downloads";
    case Message.OPEN_EXTENSION:
      return "chrome://extensions";
    case Message.OPEN_SETTINGS:
      return "chrome://settings";
    case Message.OPEN_HISTORY:
      return "chrome://history";
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
    case Message.OPEN_BOOKMARKS:
      return "chrome://bookmarks";
  }
};
