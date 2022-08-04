import { Action, Message } from "../common/types";

import { AiFillCloseCircle } from "@react-icons/all-files/ai/AiFillCloseCircle";
import { AiFillEyeInvisible } from "@react-icons/all-files/ai/AiFillEyeInvisible";
import { AiFillSetting } from "@react-icons/all-files/ai/AiFillSetting";
import { AiFillGithub } from "@react-icons/all-files/ai/AiFillGithub";
import { AiFillGoogleCircle } from "@react-icons/all-files/ai/AiFillGoogleCircle";
import { AiFillTwitterCircle } from "@react-icons/all-files/ai/AiFillTwitterCircle";
import { AiFillYoutube } from "@react-icons/all-files/ai/AiFillYoutube";
import { AiFillFacebook } from "@react-icons/all-files/ai/AiFillFacebook";
import { AiFillPushpin } from "@react-icons/all-files/ai/AiFillPushpin";

import { BiWindowClose } from "@react-icons/all-files/bi/BiWindowClose";
import { BiWindowOpen } from "@react-icons/all-files/bi/BiWindowOpen";
import { BiPlusCircle } from "@react-icons/all-files/bi/BiPlusCircle";
import { BiDownload } from "@react-icons/all-files/bi/BiDownload";
import { BiExtension } from "@react-icons/all-files/bi/BiExtension";
import { BiHistory } from "@react-icons/all-files/bi/BiHistory";
import { BiVolumeMute } from "@react-icons/all-files/bi/BiVolumeMute";
import { BiStar } from "@react-icons/all-files/bi/BiStar";
import { BiDuplicate } from "@react-icons/all-files/bi/BiDuplicate";

export function getActions(): Action[] {
  return [
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
      name: "Open History", // might no longer be needed
      message: Message.OPEN_HISTORY,
      icon: BiHistory,
    },
    {
      name: "Open Bookmarks", // might no longer ne needed
      message: Message.OPEN_BOOKMARKS,
      icon: BiStar,
    },
    // this action is used only for the current tab
    {
      name: "Mute Current Tab",
      message: Message.TOGGLE_MUTE_TAB,
      icon: BiVolumeMute,
    },

    // this action is used only for the current tab
    {
      name: "Pin Current Tab",
      message: Message.TOGGLE_PIN_TAB,
      icon: AiFillPushpin,
    },
    {
      name: "Duplicate Tab",
      message: Message.DUPLICATE_TAB,
      icon: BiDuplicate,
    },

    {
      name: "Open GitHub", // might remove this one
      message: Message.OPEN_GITHUB,
      icon: AiFillGithub,
      //   iconColor: "rgba(0, 0, 0, 0.64)",
    },
    {
      name: "Open Google",
      message: Message.OPEN_GOOGLE,
      icon: AiFillGoogleCircle,
      //   iconColor: "#ecc946"
    },
    {
      name: "Open Twitter",
      message: Message.OPEN_TWITTER,
      icon: AiFillTwitterCircle,
      // iconColor: "#4299e1"
    },
    {
      name: "Open YouTube",
      message: Message.OPEN_YOUTUBE,
      icon: AiFillYoutube,
      // iconColor: "rgba(0, 0, 0, 0.64)",
      //   iconColor: "#c53030"
    },
    {
      name: "Open Facebook",
      message: Message.OPEN_FACEBOOK,
      icon: AiFillFacebook,
      //   iconColor: "#2c5282"
    },
  ];
}
