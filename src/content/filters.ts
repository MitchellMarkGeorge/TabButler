import { TabData, ActionData } from "../common/types";

export const filterByCurrentWindow = (currentTabs: TabData[]) => {
  return currentTabs.filter((tabData) => tabData.inCurrentWindow);
};

export const tabMatchesValue = (searchValue: string, tabData: TabData) =>
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

export const filterActions = (searchValue: string, data: ActionData[]) => {
  if (searchValue) {
    return data.filter((action) =>
      action.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  } else {
    return data;
  }
};
