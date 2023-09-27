import { ActionData, ActionPayload, Message } from "@common/types";

import { sendMessageToBackground } from "../utils";

import {
  BsFillPlusCircleFill,
  BsWindowPlus,
  BsIncognito,
  BsWindowX,
  BsFiles,
  BsXCircleFill,
  BsXSquareFill,
  BsFacebook,
  BsGithub,
  BsGoogle,
  BsYoutube,
  BsTwitter,
  BsGlobe,
  BsSearch,
} from "react-icons/bs";

export function getActionsIcon(message: Message) {
  // return MagnifyingGlassIcon;

  switch (message) {
    case Message.OPEN_NEW_TAB:
      return BsFillPlusCircleFill;
    case Message.OPEN_NEW_WINDOW:
      return BsWindowPlus;
    case Message.OPEN_INCOGNITO_WINDOW:
      return BsIncognito;
    case Message.CLOSE_CURRENT_TAB:
      return BsXCircleFill;
    case Message.CLOSE_CURRENT_WINDOW:
      return BsWindowX;
    case Message.CLOSE_OTHER_TABS:
      // for now
      return BsXSquareFill;

    case Message.DUPLICATE_TAB:
      return BsFiles;
    case Message.OPEN_FACEBOOK:
      return BsFacebook;
    case Message.OPEN_GITHUB:
      return BsGithub;
    case Message.OPEN_GOOGLE:
      return BsGoogle;
    case Message.OPEN_YOUTUBE:
      return BsYoutube;
    case Message.OPEN_TWITTER:
      return BsTwitter;

    case Message.WEB_SEARCH:
      return BsSearch;
    default:
      return BsGlobe;
  }
}

export const onActionItemClick = (action: ActionData) => {
  // console.log("here", action.query);
  const messagePayload: ActionPayload = {
    message: action.message,
    query: action.query
  };
  sendMessageToBackground(messagePayload);
};
