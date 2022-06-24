import React from "react";
import { IconType } from "react-icons";

export const enum Commands {
  TOGGLE_TAB_SEARCH = "toggle-tab-search",
  TOGGLE_TAB_ACTIONS = "toggle-tab-actions",
  TOGGLE_TAB_BOOKMARKS = "toggle-tab-bookmarks",
}

export const enum Message {
  // command specific
  TOGGLE_TAB_SEARCH = "toggle-search",
  TOGGLE_TAB_ACTIONS = "toggle-actions",

  // tab search specific
  GET_TAB_DATA = "get-tab-data",
  CHANGE_TAB = "change-tab",
  TAB_DATA_UPDATE = "tab-data-update",

  UPDATE_BACKGROUND_STATE = "update-background-state",

  // tab action specific
  CLOSE_CURRENT_TAB = "close-current-tab",
  CLOSE_CURRENT_WINDOW = "close-current-window",
  OPEN_NEW_TAB = "open-new-tab",
  OPEN_NEW_WINDOW = "open-new-window",
  OPEN_INCOGNITO_WINDOW = "open-incognito-window",
  OPEN_DOWNLOADS = "open-downloads",
  OPEN_EXTENSION = "open-extensions",
  OPEN_SETTINGS = "open-settings",
  OPEN_HISTORY = "open-history",

  PIN_TAB = "pin-tab",
  MUTE_TAB = "mute-tab",

  OPEN_GITHUB = "open-github",
  OPEN_YOUTUBE = "open-youtube",
  OPEN_GOOGLE = "open-google",
  OPEN_TWITTER = "open-twitter",
  OPEN_FACEBOOK = "open-facebook",

  // when workspaces are implemented, related actions will be here

  ERROR = "error",
}

export const enum SearchMode {
  TAB_ACTIONS = "tab-actions",
  TAB_SEARCH = "tab-search",
}

export function getSearchMode(message: Message) {
  if (message === Message.TOGGLE_TAB_ACTIONS) {
    return SearchMode.TAB_ACTIONS;
  }
  // should always be the default
  return SearchMode.TAB_SEARCH;
}

export interface MessagePlayload {
  message: Message;
  // message: string
  // data: TabData[]
}

export interface ChangeTabMessagePayload extends MessagePlayload {
  message: Message.CHANGE_TAB;
  tabId: number;
}

export interface UpdatedTabDataMessagePayload extends MessagePlayload {
  message: Message.TAB_DATA_UPDATE;
  updatedTabData: TabData[];
}


export interface TabData {
  tabId: number;
  favIcon: string | null;
  tabTitle: string;
  tabUrl: string;
}

export interface Action {
  name: string;
  message: Message; // the message that the action sends to the backgrpond sctipt
  icon: IconType;
  iconColor?: string;
}
