import { ActionData, Message, MessagePlayload, Icon } from "@common/types";
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'

import browser from "webextension-polyfill";

export const searchActions = (searchValue: string, data: ActionData[]) => {
  if (searchValue) {
    return data.filter((action) =>
      action.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  } else {
    return data;
  }
};

export function getActionsIcon(message: Message): Icon {
  return MagnifyingGlassIcon;
  // switch (action.message) {
  //   case value:
      
  //     break;
  
  //   default:
  //     break;
  // }
}

export const onActionItemClick = (action: ActionData) => {
  const messagePayload: MessagePlayload = {
    message: action.message,
  };
  browser.runtime.sendMessage(messagePayload);
};
