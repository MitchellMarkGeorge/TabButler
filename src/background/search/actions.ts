import { ActionData, DataType, Message } from "@common/types";
import { nanoid } from "nanoid";

export const actions: ActionData[] = [
  {
    name: "New Tab",
    id: nanoid(),
    message: Message.OPEN_NEW_TAB,
    type: DataType.ACTION,
  },
  {
    name: "New Window",
    id: nanoid(),
    message: Message.OPEN_NEW_WINDOW,
    type: DataType.ACTION,
  },
  {
    name: "New Incognito Window",
    id: nanoid(),
    message: Message.OPEN_INCOGNITO_WINDOW,
    type: DataType.ACTION,
  },
  {
    name: "Close Tab",
    id: nanoid(),
    message: Message.CLOSE_CURRENT_TAB,
    type: DataType.ACTION,
  },
  {
    name: "Close Window",
    id: nanoid(),
    message: Message.CLOSE_CURRENT_WINDOW,
    type: DataType.ACTION,
  },
  {
    name: "Duplicate Tab",
    id: nanoid(),
    message: Message.DUPLICATE_TAB,
    type: DataType.ACTION,
  },
  {
    name: "Close Other Tabs in Window",
    id: nanoid(),
    message: Message.CLOSE_OTHER_TABS,
    type: DataType.ACTION,
  },
  {
    name: "Open Google",
    id: nanoid(),
    message: Message.OPEN_GOOGLE,
    type: DataType.ACTION,
  },
  {
    name: "Open Youtube",
    id: nanoid(),
    message: Message.OPEN_YOUTUBE,
    type: DataType.ACTION,
  },
  {
    name: "Open Facebook",
    id: nanoid(),
    message: Message.OPEN_FACEBOOK,
    type: DataType.ACTION,
  },
  {
    name: "Open Twitter",
    id: nanoid(),
    message: Message.OPEN_FACEBOOK,
    type: DataType.ACTION,
  },
];
