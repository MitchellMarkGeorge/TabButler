

export const enum Commands {
  TOGGLE_TAB_SEARCH = "toggle-tab-search",
  TOGGLE_TAB_ACTIONS = "toggle-tab-actions",
  TOGGLE_TAB_BOOKMARKS = "toggle-tab-bookmarks",
}

export const enum Message {
  TOGGLE_SEARCH = "toggle-search",
  GET_TAB_DATA = "get-tab-data",
  CHANGE_TAB = "change-tab",
  ERROR = "error",
}

export interface MessagePlayload {
    message: Message
    // message: string
    // data: TabData[]
}

export interface ChangeTabMessagePayload extends MessagePlayload {
    tabId: number
}

export interface TabData {
    tabId: number,
    favIcon: string | null,
    tabIndex:number
    tabTitle: string
    tabUrl: string
}