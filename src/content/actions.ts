import { Action, Message } from "../common/types";
import {
  AiFillCloseCircle,
  AiFillEyeInvisible,
  AiFillSetting,
  AiFillGithub,
  AiFillGoogleCircle,
  AiFillTwitterCircle,
  AiFillYoutube,
  AiFillFacebook,
} from "react-icons/ai";
import {
  BiWindowClose,
  BiWindowOpen,
  BiPlusCircle,
  BiDownload,
  BiExtension,
  BiHistory,
} from "react-icons/bi";

export function getActions(): Action[] {
  return [
    {
      name: "Close Tab",
      message: Message.CLOSE_CURRENT_TAB,
      icon: AiFillCloseCircle,
    },
    {
      name: "Close Window",
      message: Message.CLOSE_CURRENT_WINDOW,
      icon: BiWindowClose,
    },
    {
      name: "New Tab",
      message: Message.OPEN_NEW_TAB,
      icon: BiPlusCircle,
    },
    {
      name: "New Window",
      message: Message.OPEN_NEW_WINDOW,
      icon: BiWindowOpen,
    },
    {
      name: "New Incognito Window",
      message: Message.OPEN_INCOGNITO_WINDOW,
      icon: AiFillEyeInvisible,
    },
    {
      name: "Open Downloads",
      message: Message.OPEN_DOWNLOADS,
      icon: BiDownload,
    },
    {
      name: "Open Extension",
      message: Message.OPEN_EXTENSION,
      icon: BiExtension,
    },
    {
      name: "Open Settings",
      message: Message.OPEN_SETTINGS,
      icon: AiFillSetting,
    },
    {
      name: "Open History",
      message: Message.OPEN_HISTORY,
      icon: BiHistory,
    },
    {
      name: "Open GitHub",
      message: Message.OPEN_GITHUB,
      icon: AiFillGithub,
      iconColor: "rgba(0, 0, 0, 0.92)",
    },
    {
      name: "Open Google",
      message: Message.OPEN_GOOGLE,
      icon: AiFillGoogleCircle,
      //   iconColor: "#ecc946"
    },
    {
      name: "Open Twitter",
      message: Message.CLOSE_CURRENT_TAB,
      icon: AiFillTwitterCircle,
      // iconColor: "#4299e1"
    },
    {
      name: "Open YouTube",
      message: Message.OPEN_YOUTUBE,
      icon: AiFillYoutube,
      //   iconColor: "#c53030"
    },
    {
      name: "Open Facebook",
      message: Message.OPEN_FACEBOOK,
      icon: AiFillFacebook,
      //   iconColor: "#2c5282"
    },
    // mute tab
  ];
}
