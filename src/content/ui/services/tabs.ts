import browser from "webextension-polyfill";
import { ChangeTabPayload, Message, TabData } from "@common/types";

// "/" key does not work on google.com for some reason
// using "\" instead
export const TAB_FILTER_KEY = "\\";
export const TAB_FILTERS = ["muted", "audible", "pinned"]

// rename all filter methods to search
export function getTabData() {
  const messagePayload = {
    message: Message.GET_TAB_DATA,
  };
  return browser.runtime.sendMessage(messagePayload) as Promise<TabData[]>;
}

const filterByCurrentWindow = (currentTabs: TabData[]) => {
  return currentTabs.filter((tabData) => tabData.inCurrentWindow);
};

// these are not commands, they are special filters
// needs a ui indixator of these special filters
const searchByFilter = (filter: string, currentTabs: TabData[]) => {
  if (filter === "muted") return currentTabs.filter((tab) => tab.isMuted);
  else if (filter === "audible")
    return currentTabs.filter((tab) => tab.isAudible);
  else if (filter === "pinned")
    return currentTabs.filter((tab) => tab.isPinned);
  return [];
  // return currentTabs; // think about this
};

const tabMatchesValue = (searchValue: string, tabData: TabData) => {
  // the query string has already been removed from the url
  return (
    tabData.tabTitle.toLowerCase().includes(searchValue.toLowerCase()) ||
    tabData.tabUrl.toLowerCase().includes(searchValue.toLowerCase())
  );
};

export const searchTabs = (
  searchValue: string,
  data: TabData[],
  onlyCurrentWindow: boolean,
) => {
  // should be able to filter by current window even if there is no value
  const initalData: TabData[] = onlyCurrentWindow
    ? filterByCurrentWindow(data)
    : data;
  if (searchValue) {
    if (searchValue.startsWith(TAB_FILTER_KEY)) {
      const filter = searchValue.slice(1); // remove the command key
      return searchByFilter(filter, initalData);
    }
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
