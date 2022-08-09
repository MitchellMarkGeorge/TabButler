import { ActionData, ChangeTabPayload, Message, MessagePlayload, TabData } from "../common/types";
import browser from "webextension-polyfill";

export function getCurrentTabData() {
  const messagePayload = {
    message: Message.GET_TAB_DATA,
  };
  return browser.runtime.sendMessage(messagePayload) as Promise<TabData[]>;
}

export function isInvalidatedContextError(error: Error) {
  return error.message.includes("context invalidated");
}

// find right file to put these in
export const onTabItemClick = (tabData: TabData) => {
  const messagePayload: ChangeTabPayload = {
    message: Message.CHANGE_TAB,
    tabId: tabData.tabId,
    windowId: tabData.windowId,
  };
  browser.runtime.sendMessage(messagePayload);
};

export const onActionItemClick = (action: ActionData) => {
  const messagePayload: MessagePlayload = {
    message: action.message,
  };
  browser.runtime.sendMessage(messagePayload);
};
