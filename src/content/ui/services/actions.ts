import { ActionData, Message, MessagePlayload, Icon } from "@common/types";

import { sendMessageToBackground } from "../utils";
import {
  DocumentDuplicateIcon,
  EyeSlashIcon,
  GlobeAmericasIcon,
  SquaresPlusIcon,
  WindowIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function getActionsIcon(message: Message): Icon {
  // return MagnifyingGlassIcon;

  switch (message) {
    case Message.OPEN_NEW_TAB:
      return SquaresPlusIcon;
    case Message.OPEN_NEW_WINDOW:
      return WindowIcon;
    case Message.OPEN_INCOGNITO_WINDOW:
      return EyeSlashIcon;
    case Message.CLOSE_CURRENT_TAB:
    case Message.CLOSE_CURRENT_WINDOW:
    case Message.CLOSE_OTHER_TABS:
      // for now
      return XMarkIcon;

    case Message.DUPLICATE_TAB:
      return DocumentDuplicateIcon;
    default:
      return GlobeAmericasIcon;
  }
}

export const onActionItemClick = (action: ActionData) => {
  const messagePayload: MessagePlayload = {
    message: action.message,
  };
  sendMessageToBackground(messagePayload);
};
