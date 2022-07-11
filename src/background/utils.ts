import { isChromeURL } from "../common/common";
import { Message, SearchMode, TabData } from "../common/types";
import browser from "webextension-polyfill";

export async function getCurrentTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true }); // what is the difference between currentWindow and lastFocused?
  return tab;
}

export async function getTabIdWithSearchOpen(
  windowId: number,
): Promise<number | null> {
  // wde only want the active tab as that is the only place it can be in
  // get the tab in the window with search modal open and in tab search mode
  const [tab] = await browser.tabs.query({ active: true, windowId });
  return new Promise((resolve) => {
    if (tab?.id && tab.url && !isChromeURL(tab.url)) {
      browser.tabs
        .sendMessage(tab.id, { message: Message.CHECK_SEARCH_OPEN })
        .then(
          (response: { isOpen: boolean; currentSearchMode: SearchMode }) => {
            resolve(
              response &&
                response.isOpen &&
                response.currentSearchMode === SearchMode.TAB_SEARCH
                ? tab.id! // this part only executes if the id is present
                : null,
            );
          },
        );
    } else {
      resolve(null);
    }
  });
}

export async function getTabsInCurrentWindow() {
  // should it return the current tab??
  const tabs = await browser.tabs.query({ currentWindow: true });
  const results: TabData[] = [];
  const tabNum = tabs.length;

  for (let i = 0; i < tabNum; i++) {
    const tab = tabs[i];
    // will all pages have a title?
    if (tab.id && tab.id !== browser.tabs.TAB_ID_NONE && tab.url) {
      // we know that these properties will be present
      const tabData: TabData = {
        tabId: tab.id!,
        favIcon: tab.favIconUrl || null,
        tabTitle: tab.title!,
        tabUrl: tab.url!,
        // muted info
      };
      results.push(tabData);
    }
  }

  return results;
}
