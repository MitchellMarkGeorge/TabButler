import {
  COMMANDS,
  getCurrentTab,
  getTabsInCurrentWindow,
  MESSAGES,
} from "../common/common";
import { MessagePlayload } from "../common/types";

chrome.commands.onCommand.addListener(async (command) => {
  if (command === COMMANDS.TOGGLE_TAB_SEARCH) {
    console.log(command);
    const currentTab = await getCurrentTab();
    let messagePayload: MessagePlayload;

    if (currentTab?.id) {
      messagePayload = {
        message: MESSAGES.TOGGLE_SEARCH,
        data: await getTabsInCurrentWindow(),
      };
      chrome.tabs.sendMessage(currentTab.id, messagePayload);
    }
  }
});
