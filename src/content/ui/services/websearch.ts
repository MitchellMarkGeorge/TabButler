import {
  Message,
  WebSearchEngines as WebSearchEngine,
  WebSearchPayload,
} from "@common/types";
import { sendMessageToBackground } from "../utils";
import browser from "webextension-polyfill";
console.log(browser.runtime.getURL("icons/google.png"))
const webSearchItems: WebSearchEngine[] = [
  {
    name: "Google",
    url: "https://www.google.com",
    icon: browser.runtime.getURL("icons/google.png")
  },
  {
    name: "Bing",
    url: "https://www.bing.com",
    icon: browser.runtime.getURL("icons/bing.png")
  },
  {
    name: "DuckDuckGo",
    url: "https://www.duckduckgo.com",
    icon: browser.runtime.getURL("icons/duckduckgo.png")
  },
  {
    name: "Yahoo!",
    url: "https://search.yahoo.com",
    icon: browser.runtime.getURL("icons/yahoo.png")
  },
];

export const getWebSearchEngines = () => Promise.resolve(webSearchItems);
// basically just return the same data
export const searchWebSearchEngines = () => webSearchItems;

export const onWebSearchEngineClick = ({ url }: WebSearchEngine, searchValue: string) => {
  const messagePayload: WebSearchPayload = {
    message: Message.WEB_SEARCH,
    url,
    searchValue
  };
  sendMessageToBackground(messagePayload);
};
