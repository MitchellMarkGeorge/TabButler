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

  OPEN_GITHUB = "open-github",
  OPEN_YOUTUBE = "open-youtube",
  OPEN_GOOGLE = "open-google",
  OPEN_TWITTER = "open-twitter",
  OPEN_FACEBOOK = "open-facebook",

  // when workspaces are implemented, related actions will be here

  ERROR = "error",
}

export const enum SearchType {
  TAB_ACTIONS,
  TAB_SEARCH,
}

export function getSearchType(message: Message) {
  if (message === Message.TOGGLE_TAB_ACTIONS) {
    return SearchType.TAB_ACTIONS;
  }
  // should always be the default
  return SearchType.TAB_SEARCH;
}

export interface MessagePlayload {
  message: Message;
  // message: string
  // data: TabData[]
}

export interface ChangeTabMessagePayload extends MessagePlayload {
  tabId: number;
}


export interface TabData {
  tabId: number;
  favIcon: string | null;
  tabIndex: number;
  tabTitle: string;
  tabUrl: string;
}

export interface Action {
  name: string;
  message: Message; // the message that the action sends to the backgrpond sctipt
}
