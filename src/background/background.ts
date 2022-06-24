import { getCurrentSearchMode, getCurrentTab, getIsSearchOpen, getTabsInCurrentWindow, isDev, setCurrentSearchMode, setIsSearchOpen } from "../common/common";
import {
  ChangeTabMessagePayload,
  Commands,
  Message,
  MessagePlayload,
  SearchMode,
  UpdatedTabDataMessagePayload,
} from "../common/types";


if (isDev) {
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});
}

chrome.runtime.onInstalled.addListener((details) => {
    console.log(details.reason)
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // what other case is this useful for???
        setIsSearchOpen(false);
        setCurrentSearchMode(null);
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE && isDev) {
        // clear local storage on dev update
        chrome.storage.local.clear();
    }
})

chrome.commands.onCommand.addListener((command) => {
  getCurrentTab().then((currentTab) => {
    if (
      currentTab?.id &&
      // chrome does not like content scripts acting on thier urls
      !currentTab.url!.startsWith("chrome://") &&
      !currentTab.url!.startsWith("chrome-extension://") &&
      // extension webstore
      !currentTab.url!.startsWith("chrome.google.com")
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

// chrome.tabs.onRemoved.addListener(() => {
//     // send updated tab data if a tab is closed
// // does not like async await

// console.log("here")

//     Promise.all([getIsSearchOpen(), getCurrentSearchMode()]).then(values => {

//         const [ isSearchOpen, currentSearchMode ] = values;


//     // only send the updated tab data if the search is opne and the serch mode is tab search
//     if (isSearchOpen && currentSearchMode === SearchMode.TAB_SEARCH) {
//         getCurrentTab().then((currentTab) => {


//         if (currentTab?.id) {
//             const messagePayload: UpdatedTabDataMessagePayload = {
//                 message: Message.TAB_DATA_UPDATE,
//                 updatedTabData: await getTabsInCurrentWindow()
//             }
//             console.log("sending message")
//             chrome.tabs.sendMessage(currentTab.id, messagePayload);
//         }
//         })
//     }
//     })

// })

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
          highlighted: true
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
