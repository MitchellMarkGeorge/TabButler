import { TabData, ActionData } from "../common/types";

export const filterByCurrentWindow = (currentTabs: TabData[]) => {
  return currentTabs.filter((tabData) => tabData.inCurrentWindow);
};

const filterByCommand = (command: string, currentTabs: TabData[]) => {
  if (command === "muted") return currentTabs.filter((tab) => tab.isMuted);
  else if (command === "audible")
    return currentTabs.filter((tab) => tab.isAudible);
  else if (command === "pinned")
    return currentTabs.filter((tab) => tab.isPinned);
  return [];
  // return data; // think about this
};

export const tabMatchesValue = (searchValue: string, tabData: TabData) =>
  tabData.tabTitle.toLowerCase().includes(searchValue.toLowerCase()) ||
  tabData.tabUrl.toLowerCase().includes(searchValue.toLowerCase());
// ignore query params in url

const TAB_COMMAND_KEY = "/";
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
    if (searchValue.startsWith(TAB_COMMAND_KEY)) {
      const command = searchValue.slice(1); // remove the command key
      return filterByCommand(command, initalData);
    }
    return initalData.filter(
      (tabData) => tabMatchesValue(searchValue, tabData),
      // try to filter based on the tab title and the tab url
    );
  } else {
    return initalData;
  }
};

export const filterActions = (searchValue: string, data: ActionData[]) => {
  if (searchValue) {
    return data.filter((action) =>
      action.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  } else {
    return data;
  }
};
