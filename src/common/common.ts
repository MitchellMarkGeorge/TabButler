import { SearchMode, TabData } from "./types";

export const isDev = true;

export async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); // what is the difference between currentWindow and lastFocused?
  return tab;
}

const IS_SEARCH_OPEN = "is-search-open";
const CURRENT_SEARCH_MODE = "current-search-mode";

export function setIsSearchOpen(isSearchOpen: boolean) {
  chrome.storage.local.set({ IS_SEARCH_OPEN: isSearchOpen });
}

export function getIsSearchOpen(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(IS_SEARCH_OPEN, (result) => {
      resolve((result[IS_SEARCH_OPEN] ?? false as boolean));
    });
  });
}

export function setCurrentSearchMode(searchMode: SearchMode | null) {
  chrome.storage.local.set({ CURRENT_SEARCH_MODE: searchMode });
}

export function getCurrentSearchMode(): Promise<SearchMode | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(CURRENT_SEARCH_MODE, (result) => {
      // return the current search mode or retun null
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
      resolve((result[CURRENT_SEARCH_MODE] ?? null as SearchMode | null));
    });
  });
}

export async function getTabsInCurrentWindow() {
  // should I rely on this returning a promise???
  let tabs = await chrome.tabs.query({ currentWindow: true });
  return tabs
    .filter((tab) => {
      // will all pages have a title?
      return tab.id && tab.id !== chrome.tabs.TAB_ID_NONE && tab.url;
    })
    .map(({ id, favIconUrl, index, title, url }) => {
      // we know that these properties will be present
      const tabData: TabData = {
        tabId: id!,
        favIcon: favIconUrl || null,
        tabTitle: title!,
        tabUrl: url!,
        // muted info
      };
      return tabData;
    });
}
