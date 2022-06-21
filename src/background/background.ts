import { getCurrentTab, getTabsInCurrentWindow } from "../common/common";
import {
  ChangeTabMessagePayload,
  Commands,
  Message,
  MessagePlayload,
} from "../common/types";

chrome.commands.onCommand.addListener((command) => {
  getCurrentTab().then((currentTab) => {
    if (currentTab?.id) {
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

chrome.runtime.onMessage.addListener(
  (messagePayload: MessagePlayload, sender, sendResponse) => {
    if (messagePayload.message === Message.GET_TAB_DATA) {
      getTabsInCurrentWindow().then((currentTabs) => {
        console.log(currentTabs);
        sendResponse(currentTabs);
      }); // send message is error occured (.catch())
      return true;
    } else if (messagePayload.message === Message.CHANGE_TAB) {
      // change the tab
      const { tabId } = messagePayload as ChangeTabMessagePayload;
      chrome.tabs.update(tabId, {
        active: true,
      });
    }
  }
);
