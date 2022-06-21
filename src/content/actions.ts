import { Action, Message } from "../common/types";

export function getActions(): Action[] {
  return [
    {
      name: "Close Tab",
      message: Message.CLOSE_CURRENT_TAB,
    },
    {
      name: "Close Window",
      message: Message.CLOSE_CURRENT_WINDOW,
    },
    {
      name: "Open New Tab",
      message: Message.OPEN_NEW_TAB,
    },
    {
      name: "Open New Window",
      message: Message.OPEN_NEW_WINDOW,
    },
    {
      name: "Open Incognito Window",
      message: Message.OPEN_INCOGNITO_WINDOW,
    },
    {
      name: "Open Downloads",
      message: Message.OPEN_DOWNLOADS,
    },
    {
      name: "Open Extension",
      message: Message.OPEN_EXTENSION,
    },
    {
      name: "Open Settings",
      message: Message.OPEN_SETTINGS,
    },
    {
      name: "Open History",
      message: Message.OPEN_HISTORY,
    },
    {
      name: "Open GitHub",
      message: Message.OPEN_GITHUB,
    },
    {
      name: "Open Google",
      message: Message.OPEN_GOOGLE,
    },
    {
      name: "Open Twitter",
      message: Message.CLOSE_CURRENT_TAB,
    },
    {
      name: "Open YouTube",
      message: Message.OPEN_YOUTUBE,
    },
    {
      name: "Open Facebook",
      message: Message.OPEN_FACEBOOK,
    },
  ];
}
