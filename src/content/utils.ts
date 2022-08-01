import { Action, Message, TabData } from "../common/types";
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


export const filterByCurrentWindow = (currentTabs: TabData[]) => {
  return currentTabs.filter((tabData) => tabData.inCurrentWindow);
};


export const tabMatchesValue = (searchValue: string, tabData: TabData) =>
  tabData.tabTitle.toLowerCase().includes(searchValue.toLowerCase()) ||
  tabData.tabUrl.toLowerCase().includes(searchValue.toLowerCase());

export const filterTabs = (searchValue: string, currentTabs: TabData[]) => {
  return currentTabs.filter(
    (tabData) => tabMatchesValue(searchValue, tabData),
    // try to filter based on the tab title and the tab url
  );
};

export const filterActions = (searchValue: string, actions: Action[]) => {
  return actions.filter((action) =>
    action.name.toLowerCase().includes(searchValue.toLowerCase()),
  );
};
