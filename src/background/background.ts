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
  getTabIdWithSearchOpen,
  getTabsInCurrentWindow,
} from "./utils";

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (
    reason === chrome.runtime.OnInstalledReason.INSTALL ||
    reason === chrome.runtime.OnInstalledReason.UPDATE
  ) {
    // IMPORTANT inject content script into all tabs on isntall so it is ready to be used once installed
    // do the same thing on updates
    // unfortunately, if doing this on update, this leaves the previous content script still on the page
    // and it might still try and comunicate with the extension, resulting in an error
    const manifest = chrome.runtime.getManifest();
    // in our case there will only be one but just in case we decide to change that
    const extensionContentScripts = manifest.content_scripts![0].js!;
    const extensionCss = manifest.content_scripts![0].css![0];
    // inject the extension into all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (
          tab.id &&
          tab.id !== chrome.tabs.TAB_ID_NONE &&
          !isChromeURL(tab.url!)
        ) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: extensionContentScripts,
          });
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            css: extensionCss,
          });
        }
      });
    });
  }
});

chrome.commands.onCommand.addListener((command) => {
  getCurrentTab().then((currentTab) => {
    if (
      currentTab?.id &&
      // chrome does not like content scripts acting on thier urls
      !isChromeURL(currentTab.url!)
    ) {
      let messagePayload: MessagePlayload = {
        message:
          command === Commands.TOGGLE_TAB_ACTIONS
            ? Message.TOGGLE_TAB_ACTIONS
            : Message.TOGGLE_TAB_SEARCH, // basically fall back to the search
      };
      chrome.tabs.sendMessage(currentTab.id, messagePayload);
    }
  }); // handle error
});

// SHOULD ONLY SEND UPDATED TAB DATA IF A TAB IN THE SAME WINDOW AS THE OPEN SEARCH IS CLOSED
chrome.tabs.onRemoved.addListener((removedTabId, removedTabInfo) => {
  // send updated tab data if a tab is closed
  // does not like async await
  if (!removedTabInfo.isWindowClosing) {
    // essentially try and see if there is an active tab in that window with the search open and in tab search mode
    // if there is, send the tab the updated tab data
    getTabIdWithSearchOpen(removedTabInfo.windowId).then((tabId) => {
      if (tabId) {
        getTabsInCurrentWindow().then((updatedTabData) => {
          const messagePayload: UpdatedTabDataMessagePayload = {
            message: Message.TAB_DATA_UPDATE,
            updatedTabData,
          };
          console.log("sending message");
          chrome.tabs.sendMessage(tabId, messagePayload);
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener(
  (messagePayload: MessagePlayload, sender, sendResponse) => {
    // turn this into switch statement
    switch (messagePayload.message) {
      case Message.GET_TAB_DATA: {
        getTabsInCurrentWindow().then((currentTabs) => {
          sendResponse(currentTabs);
        }); // send message is error occured (.catch())
        return true;
      }
      case Message.CHANGE_TAB:
        const { tabId } = messagePayload as ChangeTabMessagePayload;
        chrome.tabs.update(tabId, {
          active: true,
          highlighted: true, // this might not be needed
        });
        break;

      case Message.CLOSE_CURRENT_TAB:
        // if not throw error?
        if (sender.tab?.id) {
          chrome.tabs.remove(sender.tab.id);
          break;
        }
      case Message.CLOSE_CURRENT_WINDOW:
        if (sender.tab?.windowId) {
          chrome.windows.remove(sender.tab.windowId);
          break;
        }

      case Message.OPEN_NEW_TAB:
        chrome.tabs.create({ active: true });
        break;

      case Message.OPEN_NEW_WINDOW:
      case Message.OPEN_INCOGNITO_WINDOW:
        chrome.windows.create({
          focused: true,
          incognito: messagePayload.message === Message.OPEN_INCOGNITO_WINDOW,
        });
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
        const url = getUrl(messagePayload.message);
        chrome.tabs.create({ active: true, url });
        break;
    }
  }
);

const getUrl = (message: Message) => {
  switch (message) {
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
  }
};
