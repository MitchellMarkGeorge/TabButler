import { ChangeTabPayload, Message, TabData } from "@common/types";
import { sendMessageToBackground } from "../utils";

export const onTabItemClick = (tabData: TabData) => {
  const messagePayload: ChangeTabPayload = {
    message: Message.CHANGE_TAB,
    tabId: tabData.tabId,
    windowId: tabData.windowId,
  };
  sendMessageToBackground(messagePayload);
};
