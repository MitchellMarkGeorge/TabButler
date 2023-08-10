// import { IconType } from "@react-icons/all-files";

// import type { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import type React from "react";

// type Icon = typeof MagnifyingGlassIcon;
export type Icon = React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  title?: string | undefined;
  titleId?: string | undefined;
} & React.RefAttributes<SVGSVGElement>>

// export const enum Command {
//   TOGGLE_TAB_SEARCH = "toggle-tab-search",
//   TOGGLE_TAB_ACTIONS = "toggle-tab-actions",
//   TOGGLE_TAB_BOOKMARKS = "toggle-tab-bookmarks",
//   TOGGLE_TAB_HISTORY = "toggle-tab-history",
// }

// name space Messages according to their use using a union(?) of enums
// type Message =  CommandMessage | TabSearchMessage | TabActionMessage
export const enum Message {
  // command specific
  TOGGLE_TAB_BUTLER_MODAL = "toggle-tab-butler-modal",

  // tab search specific
  GET_TAB_DATA = "get-tab-data",
  GET_HISTORY_DATA = "get-history-data",

  CHANGE_TAB = "change-tab",
  TAB_DATA_UPDATE = "tab-data-update",

  CLOSE_GIVEN_TAB = "close-given-tab", // used to close a given tab
  TOGGLE_MUTE_GIVEN_TAB = "toggle-mute-given-tab",
  TOGGLE_PIN_GIVEN_TAB = "toggle-pin-given-tab",

  // tab action specific
  CLOSE_CURRENT_TAB = "close-current-tab",
  CLOSE_CURRENT_WINDOW = "close-current-window",
  OPEN_NEW_TAB = "open-new-tab",
  OPEN_NEW_WINDOW = "open-new-window",
  OPEN_INCOGNITO_WINDOW = "open-incognito-window",

  TOGGLE_PIN_CURRENT_TAB = "toggle-pin-tab",
  TOGGLE_MUTE_CURRENT_TAB = "toggle-mute-tab",
  DUPLICATE_TAB = "duplicate-tab",
  CLOSE_DUPLICATE_TABS = "close-duplicate-tabs",
  CLOSE_OTHER_TABS = "close-other-tabs",

  CHECK_SEARCH_OPEN = "check-search-open",

  OPEN_GITHUB = "open-github",
  OPEN_YOUTUBE = "open-youtube",
  OPEN_GOOGLE = "open-google",
  OPEN_TWITTER = "open-twitter",
  OPEN_FACEBOOK = "open-facebook",
  OPEN_HISTORY_ITEM = "open-history-item",

  // when workspaces are implemented, related actions will be here

  ERROR = "error",
}

export const enum DataType {
  TAB = "TAB",
  ACTION = "ACTION",
  BOOKMARK = "BOOKMARK",
  HISTORY = "HISTORY",
}

export const enum SearchMode {
  TAB_ACTIONS = "tab-actions",
  TAB_SEARCH = "tab-search",
  TAB_HISTORY = "tab-history",
}

export interface MessagePlayload {
  message: Message;
  // message: string
  // data: TabData[]
}

export interface ChangeTabPayload extends MessagePlayload {
  // use GivenTabMessagePayload
  message: Message.CHANGE_TAB;
  // just send the TabData?
  tabId: number;
  windowId: number;
}

export interface GivenTabPayload extends MessagePlayload {
  // generic interface to handle tabs actions for a given tab
  tabId: number;
}

export interface TogglePinTabPayload extends GivenTabPayload {
  isPinned: boolean;
}

export interface ToggleMuteTabPayload extends GivenTabPayload {
  tabId: number;
  isMuted: boolean;
}

export interface UpdatedTabDataPayload extends MessagePlayload {
  message: Message.TAB_DATA_UPDATE;
  updatedTabData: TabData[];
}

export interface OpenHistoryItemPayload extends MessagePlayload {
  message: Message.OPEN_HISTORY_ITEM;
  url: string;
}

// export type Data = TabData | ActionData | HistoryData;
export interface Data {
  type: DataType;
  id: string
}

export interface TabData extends Data {
  tabId: number;
  windowId: number;
  favIcon: string | null;
  title: string;
  url: string;
  type: DataType.TAB;
  // will leave this for now
  // isAudible: boolean;
  // isMuted: boolean;
  // isPinned: boolean;
}

export interface ActionData extends Data {
  name: string;
  // message: Message; // the message that the action sends to the backgrpond sctipt
  icon: Icon; // for now
  iconColor?: string;
  type: DataType.ACTION;
}

export interface HistoryData extends Data {
  title: string,
  url: string,
  timeVisited: number
  type: DataType.HISTORY;

}

export interface BookmarkData extends Data {
  title: string;
  url: string;
  type: DataType.BOOKMARK;
}

export interface CheackSearchOpenResponse {
  isOpen: boolean;
  currentSearchMode: SearchMode;
}

export interface SectionType {
  name: string;
  matchScore: number; 
  items: Data[] // sorted
}

export interface ScoredDataType {
  matchScore: number
}

