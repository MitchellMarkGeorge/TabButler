import {
  COMMANDS,
  getCurrentTab,
  getTabsInCurrentWindow,
  MESSAGES,
} from "../common/common";
import { MessagePlayload } from "../common/types";

chrome.commands.onCommand.addListener((command) => {
  // should I still use async await?? should I just use promises isted
  // should I just use the tab provided by the listener
  if (command === COMMANDS.TOGGLE_TAB_SEARCH) {
    console.log(command);
    getCurrentTab().then((currentTab) => {
      let messagePayload: MessagePlayload;

      if (currentTab?.id) {
        messagePayload = {
          message: MESSAGES.TOGGLE_SEARCH,
          // data: await getTabsInCurrentWindow(),
        };
        chrome.tabs.sendMessage(currentTab.id, messagePayload);
      }
    });
  }
});

chrome.runtime.onMessage.addListener(
  (messagePayload: MessagePlayload, sender, sendResponse) => {
    if (messagePayload.message === MESSAGES.GET_TAB_DATA) {
      getTabsInCurrentWindow().then((currentTabs) => {
        console.log(currentTabs);
        sendResponse(currentTabs);
      }); // send message is error occured (.catch())
    }
    return true;
  }
);
