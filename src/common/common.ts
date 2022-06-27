import { Message, SearchMode, TabData } from "./types";

export const isDev = true;


export function isChromeURL(url: string) {
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    // extension webstore
    url.startsWith("chrome.google.com")
  );
}

