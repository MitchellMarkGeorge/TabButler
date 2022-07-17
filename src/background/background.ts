import { isChromeURL } from "../common/common";
import {
  ChangeTabMessagePayload,
  Commands,
  Message,
  MessagePlayload,
  UpdatedTabDataMessagePayload,
} from "../common/types";
import {
  getCurrentTab,
  getTabsInCurrentWindow,
  getTabsWithSearchOpen,
  injectExtension,
} from "./utils";
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(async ({ reason }) => {
  // should this be async?
  // should I do this on update?
  if (reason === "install") {
    // injectig on update might clash with already installed content script.
    // inject extension
    // open the welcome page
    // opening the welcome page first buys the extension time to inject into the avalible pages
      const welcomeUrl = "https://tabbutler.netlify.app/welcome"
      await browser.tabs.create({ url: welcomeUrl }); // not really nessecary to await
    await injectExtension();
  }
});

browser.commands.onCommand.addListener((command) => {
  // should I make these async?
  getCurrentTab().then((currentTab) => {
    if (
      currentTab?.id &&
      currentTab.url &&
      // chrome does not like content scripts acting on thier urls
      !isChromeURL(currentTab.url)
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
browser.tabs.onRemoved.addListener(() => {
  // should I make these async?
  // send updated tab data if a tab is closed
  // does not like async await
  // if we are doing browser wide search, need to hadle changes in other windows
  // the idea is just to send all open tab search modals an update
  // if (!removedTabInfo.isWindowClosing) { // what happens if an entire window is closing
    // essentially try and see if there is an active tab in that window with the search open and in tab search mode
    // if there is, send the tab the updated tab data
    getTabsWithSearchOpen().then((tabIds) => {
      console.log(tabIds);
      // for each active tab with their search open, send an update tto them
      tabIds.forEach((id) => {
        getTabsInCurrentWindow().then((updatedTabData) => {
          const messagePayload: UpdatedTabDataMessagePayload = {
            message: Message.TAB_DATA_UPDATE,
            updatedTabData,
          };
          console.log("sending message");
          browser.tabs.sendMessage(id, messagePayload);
        });
      });
    });
  // }
});

browser.runtime.onMessage.addListener(
  (messagePayload: MessagePlayload, sender) => {
    // should I be relying on the sender.tab?
    // should be present if the sender is a content script (would equate to the current tab)
    // https://developer.chrome.com/docs/extensions/reference/runtime/#type-MessageSender
    switch (messagePayload.message) {
      case Message.GET_TAB_DATA:
        return Promise.resolve(getTabsInCurrentWindow());

      case Message.CHANGE_TAB: {
        const { tabId, windowId } = messagePayload as ChangeTabMessagePayload;
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
      case Message.TOGGLE_PIN_TAB:
        // toggle pinned
        if (sender.tab?.id) {
          const currentPinnedSatus = sender.tab.pinned;
          browser.tabs.update(sender.tab.id, { pinned: !currentPinnedSatus });
        }
        break;
      case Message.TOGGLE_MUTE_TAB:
        // toggle muted
        if (sender.tab?.id && sender.tab.mutedInfo) {
          const currentMutedStatus = sender.tab.mutedInfo.muted;
          browser.tabs.update(sender.tab.id, { muted: !currentMutedStatus });
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
