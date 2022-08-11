import browser from "webextension-polyfill";
import { ChangeTabPayload, Message, TabData } from "@common/types";

export function getTabData() {
  const messagePayload = {
    message: Message.GET_TAB_DATA,
  };
  return browser.runtime.sendMessage(messagePayload) as Promise<TabData[]>;
}

const filterByCurrentWindow = (currentTabs: TabData[]) => {
  return currentTabs.filter((tabData) => tabData.inCurrentWindow);
};

const tabMatchesValue = (searchValue: string, tabData: TabData) =>
  tabData.tabTitle.toLowerCase().includes(searchValue.toLowerCase()) ||
  tabData.tabUrl.toLowerCase().includes(searchValue.toLowerCase());

export const filterTabs = (
  searchValue: string,
  data: TabData[],
  onlyCurrentWindow: boolean,
) => {
  // should be able to filter by current window even if there is no value
  const initalData: TabData[] = onlyCurrentWindow
    ? filterByCurrentWindow(data)
    : data;
  if (searchValue) {
    return initalData.filter(
      (tabData) => tabMatchesValue(searchValue, tabData),
      // try to filter based on the tab title and the tab url
    );
  } else {
    return initalData;
  }
};

export const onTabItemClick = (tabData: TabData) => {
  const messagePayload: ChangeTabPayload = {
    message: Message.CHANGE_TAB,
    tabId: tabData.tabId,
    windowId: tabData.windowId,
  };
  browser.runtime.sendMessage(messagePayload);
};
