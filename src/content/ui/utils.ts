import { MessagePlayload } from "@common/types";
import browser from "webextension-polyfill";

export function isInvalidatedContextError(error: Error) {
  return error.message.includes("context invalidated");
}

export function sendMessageToBackground<T>(messagePayload: MessagePlayload) {
  return browser.runtime.sendMessage(messagePayload) as Promise<T>;
}
