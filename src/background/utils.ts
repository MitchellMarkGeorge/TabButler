import { isChromeURL } from "../common/common";
import { Message, SearchMode, TabData } from "../common/types";
import browser from "webextension-polyfill";

export async function getCurrentTab() {
  let [tab] = await browser.tabs.query({ active: true, currentWindow: true }); // what is the difference between currentWindow and lastFocused?
  return tab;
}

export async function getTabIdWithSearchOpen(
  windowId: number
): Promise<number | null> {
  // wde only want the active tab as that is the only place it can be in
  // get the tab in the window with search modal open and in tab search mode
  const [tab] = await browser.tabs.query({ active: true, windowId });
  return new Promise((resolve, reject) => {
    if (tab?.id && !isChromeURL(tab.url!)) {
      browser.tabs
        .sendMessage(tab.id, { message: Message.CHECK_SEARCH_OPEN })
        .then(
          (response: { isOpen: boolean; currentSearchMode: SearchMode }) => {
            resolve(
              response &&
                response.isOpen &&
                response.currentSearchMode === SearchMode.TAB_SEARCH
                ? tab.id!
                : null
            );
          }
        );
    } else {
      resolve(null);
    }
  });
}

export async function getTabsInCurrentWindow() {
  // should it return the current tab??
  let tabs = await browser.tabs.query({ currentWindow: true });
  return tabs
    .filter((tab) => {
      // will all pages have a title?
      return tab.id && tab.id !== browser.tabs.TAB_ID_NONE && tab.url;
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
