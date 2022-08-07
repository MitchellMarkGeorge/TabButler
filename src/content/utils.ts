import { Message, TabData } from "../common/types";
import browser from "webextension-polyfill";

export function getCurrentTabData() {
  const messagePayload = {
    message: Message.GET_TAB_DATA,
  };
  return browser.runtime.sendMessage(messagePayload) as Promise<TabData[]>;
}

export function isInvalidatedContextError(error: Error) {
  return error.message.includes("context invalidated");
}


