import { nanoid } from "nanoid";
import { isBrowserURL } from "../common/common";
import {
  BookmarkData,
  DataType,
  HistoryData,
  TabData,
  // UpdatedTabDataPayload,
} from "../common/types";
import browser from "webextension-polyfill";

// TODO: organize all the functions in this file

export async function changeTab(windowId: number, tabId: number) {
  await browser.windows.update(windowId, { focused: true });
  await browser.tabs.update(tabId, { active: true });
}

export async function getCurrentTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

const cleanTabUrl = (url: string) => {
  // https://bobbyhadz.com/blog/javascript-remove-querystring-from-url
  // this method removes all the query params but leaves the hash
  // the hash is kept as in some cases, it can help users "match" with what they are looking for (eg: a section title in a website they are on)
  if (url.includes("?")) {
    return url.slice(0, url.indexOf("?")) + url.slice(url.indexOf("#"));
  } else return url;
};

export async function fetchAllTabs() {
  // should it return the current tab??
  // should we be using the lastFocused?
  const tabs = await browser.tabs.query({});
  const results: TabData[] = [];
  const tabNum = tabs.length;

  for (let i = 0; i < tabNum; i++) {
    const tab = tabs[i];
    if (
      tab.id &&
      tab.id !== browser.tabs.TAB_ID_NONE &&
      tab.url &&
      tab.windowId &&
      tab.windowId !== browser.windows.WINDOW_ID_NONE
    ) {
      // we know that these properties will be present
      results.push({
        type: DataType.TAB,
        id: nanoid(),
        tabId: tab.id,
        windowId: tab.windowId,
        favIcon: tab.favIconUrl || null,
        title: tab.title!, // we know this will be present
        url: cleanTabUrl(tab.url), // think about this (should be good for search)
      });
    }
  }

  return results;
}

export async function searchHistory(query: string) {
  const history = await browser.history.search({ text: query });
  const results: HistoryData[] = [];

  const historyNum = history.length;
  for (let i = 0; i < historyNum; i++) {
    const { title, url, lastVisitTime } = history[i];
    if (title && url && lastVisitTime !== undefined) {
      results.push({
        type: DataType.HISTORY,
        id: nanoid(),
        title,
        url,
        timeVisited: lastVisitTime,
      });
    }
  }

  return results;
}

export async function searchBookmarks(query: string) {
  const bookmarks = await browser.bookmarks.search(query);
  return normalizeBookmarks(bookmarks);
}

function normalizeBookmarks(bookmarks: browser.Bookmarks.BookmarkTreeNode[]) {
  const bookmarkNum = bookmarks.length;
  const results: BookmarkData[] = [];
  for (let i = 0; i < bookmarkNum; i++) {
    const bookmark = bookmarks[i];
    if (bookmark.children) {
      results.push(...normalizeBookmarks(bookmark.children));
    } else {
      results.push({
        type: DataType.BOOKMARK,
        id: nanoid(),
        title: bookmark.title,
        url: bookmark.url!, // should be present if it since it is not a folder 
      });
    } 
  }
  return results;
}

export async function injectExtension() {
  const manifest = browser.runtime.getManifest();
  // we know that these values will be present
  const extensionContentScripts = manifest.content_scripts![0].js!;
  // inject the extension into all tabs
  const tabs = await browser.tabs.query({ status: "complete" }); // think about this
  const tabsLength = tabs.length;
  // use while loop?
  // this is O(n);
  for (let i = 0; i < tabsLength; i++) {
    const tab = tabs[i];
    if (
      tab.id &&
      tab.id !== browser.tabs.TAB_ID_NONE &&
      tab.url && // tab.url is only present if the permission is present, which it is
      !isBrowserURL(tab?.url)
    ) {
      await browser.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: extensionContentScripts,
      });
    }
  }
  // popular way I have seen it done in othe extensions, this changes the time complexity to O(n^2)

  // const windows = await browser.windows.getAll({ populate: true}); // what does populate mean
  // const windowLength = windows.length;
  // for (let i = 0; i < windowLength; i++) {
  //   const window = windows[i];
  //   const tabs = window.tabs;
  //   if (tabs) {
  //     const tabsLength = tabs.length;
  //     for (let j = 0; j < tabsLength; j++) {
  //       const tab = tabs[j];
  //       console.log(tab);
  //       if (
  //         tab.id &&
  //         tab.id !== browser.tabs.TAB_ID_NONE &&
  //         tab.url && // tab.url is only present if the permission is present, which it is
  //         !isChromeURL(tab?.url)
  //         && tab?.status === "complete"
  //       ) {
  //         await browser.scripting.executeScript({
  //           target: { tabId: tab.id, allFrames: false },
  //           files: extensionContentScripts,
  //         });
  //         await browser.scripting.insertCSS({
  //           target: { tabId: tab.id, allFrames: false },
  //           files: extensionCss
  //         });
  //       }
  //     }
  //   }
  // }
}

export const checkCommands = async () => {
  // simple function to check if ther are any unbound commands due to conflicts
  const commands = await browser.commands.getAll();
  for (const { shortcut } of commands) {
    if (!shortcut) return true;
  }
  return false;
};
