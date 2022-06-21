import { TableIcon } from "@heroicons/react/outline";
import {
  getCurrentTab,
  getTabsInCurrentWindow,
} from "../common/common";
import { ChangeTabMessagePayload, Commands, Message, MessagePlayload } from "../common/types";

chrome.commands.onCommand.addListener((command) => {
  // should I still use async await?? should I just use promises isted
  // should I just use the tab provided by the listener
  if (command === Commands.TOGGLE_TAB_SEARCH) {
    getCurrentTab().then((currentTab) => {
      let messagePayload: MessagePlayload;

      if (currentTab?.id) {
        messagePayload = {
          message: Message.TOGGLE_SEARCH,
          // data: await getTabsInCurrentWindow(),
        };
        chrome.tabs.sendMessage(currentTab.id, messagePayload);
      }
    });
  }
});

chrome.runtime.onMessage.addListener(
  (messagePayload: MessagePlayload, sender, sendResponse) => {
    if (messagePayload.message === Message.GET_TAB_DATA) {
      getTabsInCurrentWindow().then((currentTabs) => {
        console.log(currentTabs);
        sendResponse(currentTabs);
      }); // send message is error occured (.catch())
      return true
    } else if (messagePayload.message === Message.CHANGE_TAB) {
        // change the tab
      chrome.tabs.update((messagePayload as ChangeTabMessagePayload).tabId, {
        active: true,
      });
    }
  }
);
