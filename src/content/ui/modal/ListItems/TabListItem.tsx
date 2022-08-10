import { IconContext } from "@react-icons/all-files";
import { AiFillPushpin } from "@react-icons/all-files/ai/AiFillPushpin";
import { AiOutlinePushpin } from "@react-icons/all-files/ai/AiOutlinePushpin";
import { HiOutlineGlobe } from "@react-icons/all-files/hi/HiOutlineGlobe";
import { HiVolumeOff } from "@react-icons/all-files/hi/HiVolumeOff";
import { HiVolumeUp } from "@react-icons/all-files/hi/HiVolumeUp";
import { RiCloseLine } from "@react-icons/all-files/ri/RiCloseLine";
import React, { useState } from "react";
import {
  GivenTabPayload,
  Message,
  TabData,
  ToggleMuteTabPayload,
  TogglePinTabPayload
} from "../../../../common/types";
import { useIsDarkMode } from "../hooks";
import { ListItem, ListItemProps } from "./ListItem";

import browser from "webextension-polyfill";

export const TabListItem: React.FC<ListItemProps<TabData>> = ({
  data,
  onClick,
  onHover,
  selected,
}: ListItemProps<TabData>) => {
  // const ref = useScroll(selected);
  const [hasImageError, setHasImageError] = useState(false);
  // is it fine to be used like this???
  const isDarkMode = useIsDarkMode();

  const getHostname = (url: string) => {
    return new URL(url).hostname;
  };
  const getFallBackIcon = () => (
    <HiOutlineGlobe
      size="24px"
      color={isDarkMode ? "rgba(255, 255, 255, 0.36)" : "rgba(0, 0, 0, 0.36)"}
    />
  );

  const showFaviconImage = () => {
    if (data.favIcon) {
      if (hasImageError) {
        return getFallBackIcon();
      } else {
        return (
          <img src={data.favIcon} onError={() => setHasImageError(true)} />
        );
      }
    } else {
      return getFallBackIcon();
    }
  };

  const showVolumeIcon = () => {
    // must be first as it can be audible but still muted
    if (data.isMuted) return <HiVolumeOff />;
    if (data.isAudible) return <HiVolumeUp />;
  };

  const closeTab = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation(); // must be called so the parent onClick listener is not called
    const messagePayload: GivenTabPayload = {
      message: Message.CLOSE_GIVEN_TAB,
      tabId: data.tabId,
    };
    browser.runtime.sendMessage(messagePayload);
  };

  const togglePinTab = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    const messagePayload: TogglePinTabPayload = {
      message: Message.TOGGLE_PIN_GIVEN_TAB,
      tabId: data.tabId,
      isPinned: data.isPinned
    };
    browser.runtime.sendMessage(messagePayload);
  };

  const toggleMuteTab = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    const messagePayload: ToggleMuteTabPayload = {
      message: Message.TOGGLE_MUTE_GIVEN_TAB,
      tabId: data.tabId,
      isMuted: data.isMuted
    };
    browser.runtime.sendMessage(messagePayload);
  };

  return (
    <ListItem
      // style={style}
      onClick={() => onClick(data)}
      selected={selected}
      // ref={ref}
      onMouseOver={onHover}
    >
      <div className="main_info_container">
        {/* handle potential image error when trying to load favicon  */}
        {showFaviconImage()}
        <div className="text_container">
          <div className="main_text">{data.tabTitle}</div>
          {/* getHostname() could return an empty host name - should the secondary text be conditionally rendered? */}
          {/* show if in current window */}
          {/* <div className="secondary_text">
          {data.inCurrentWindow
            ? `${getHostname(data.tabUrl)} \u00b7 Current Window`
            : getHostname(data.tabUrl)}
        </div> */}
          <div className="secondary_text">
            {/* in case getHostname() returns an empty string */}
            {getHostname(data.tabUrl) || data.tabUrl}
          </div>
        </div>
      </div>
      {selected && (
        <div className="button_container">
          {/* using the IconContext to reduce repitition */}
          <IconContext.Provider value={{ color: "#fff", size: "24px" }}>
            {/* if the tab is playing sound, show the HiVolumeUp so the user knows can can mute it*/}
            {/* if the tab is muted, show the HiVolumeOff so the user knows and can can can unmute it*/}
            {/* otherwise, nothing is shown */}
            {(data.isAudible || data.isMuted) && (
              <div
                className="icon_button"
                onClick={toggleMuteTab}
              >
                {showVolumeIcon()}
              </div>
            )}
            <div
              className="icon_button"
              onClick={togglePinTab}
            >
              {data.isPinned ? <AiFillPushpin /> : <AiOutlinePushpin />}
            </div>
            <div
              className="icon_button"
              onClick={closeTab}
            >
              <RiCloseLine />
            </div>
          </IconContext.Provider>
        </div>
      )}
    </ListItem>
  );
};
