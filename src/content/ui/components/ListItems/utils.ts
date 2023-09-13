import browser from "webextension-polyfill";

  export const getHostname = (url: string) => {
    return new URL(url).hostname;
  };

  // https://developer.chrome.com/docs/extensions/mv3/favicon/
  export const getFaviconURL = (websiteUrl: string) => {
    const url = new URL(browser.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", websiteUrl);
    url.searchParams.set("size", "24");
    return url.toString();
  }