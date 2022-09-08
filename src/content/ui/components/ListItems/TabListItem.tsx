import { IconContext } from "@react-icons/all-files";
import { AiFillPushpin } from "@react-icons/all-files/ai/AiFillPushpin";
import { AiOutlinePushpin } from "@react-icons/all-files/ai/AiOutlinePushpin";
// import { HiOutlineGlobe } from "@react-icons/all-files/hi/HiOutlineGlobe";
import { HiVolumeOff } from "@react-icons/all-files/hi/HiVolumeOff";
import { HiVolumeUp } from "@react-icons/all-files/hi/HiVolumeUp";
import { RiCloseLine } from "@react-icons/all-files/ri/RiCloseLine";
import React, { useState } from "react";
import {
  GivenTabPayload,
  Message,
  TabData,
  ToggleMuteTabPayload,
  TogglePinTabPayload,
} from "@common/types";
import { useIsDarkMode } from "../../hooks";
import {
  ListItem,
  ListItemProps,
  MainInfoContainer,
  SecondaryText,
  TextContainer,
  MainText,
  ButtonContainer,
  IconButton,
} from "./ListItem";

import browser from "webextension-polyfill";
import { getHostname } from "./utls";
// import { HiOutlineGlobe } from "@react-icons/all-files/hi/HiOutlineGlobe";
import { HiGlobe } from "@react-icons/all-files/hi/HiGlobe";

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

  const getFallBackIcon = () => (
    <HiGlobe
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

  const togglePinTab = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    const messagePayload: TogglePinTabPayload = {
      message: Message.TOGGLE_PIN_GIVEN_TAB,
      tabId: data.tabId,
      isPinned: data.isPinned,
    };
    browser.runtime.sendMessage(messagePayload);
  };

  const toggleMuteTab = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    const messagePayload: ToggleMuteTabPayload = {
      message: Message.TOGGLE_MUTE_GIVEN_TAB,
      tabId: data.tabId,
      isMuted: data.isMuted,
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
      <MainInfoContainer>
        {/* handle potential image error when trying to load favicon  */}
        {showFaviconImage()}
        <TextContainer>
          <MainText>{data.tabTitle}</MainText>
          {/* getHostname() could return an empty host name - should the secondary text be conditionally rendered? */}
          {/* show if in current window */}
          {/* <div className="secondary_text">
          {data.inCurrentWindow
            ? `${getHostname(data.tabUrl)} \u00b7 Current Window`
            : getHostname(data.tabUrl)}
        </div> */}
          <SecondaryText>
            {/* in case getHostname() returns an empty string */}
            {getHostname(data.tabUrl) || data.tabUrl}
          </SecondaryText>
        </TextContainer>
      </MainInfoContainer>
      {selected && (
        <ButtonContainer>
          {/* using the IconContext to reduce repitition */}
          <IconContext.Provider value={{ color: "#fff", size: "24px" }}>
            {/* if the tab is playing sound, show the HiVolumeUp so the user knows can can mute it*/}
            {/* if the tab is muted, show the HiVolumeOff so the user knows and can can can unmute it*/}
            {/* otherwise, nothing is shown */}
            {(data.isAudible || data.isMuted) && (
              <IconButton onClick={toggleMuteTab}>
                {showVolumeIcon()}
              </IconButton>
            )}
            <IconButton onClick={togglePinTab}>
              {data.isPinned ? <AiFillPushpin /> : <AiOutlinePushpin />}
            </IconButton>
            <IconButton onClick={closeTab}>
              <RiCloseLine />
            </IconButton>
          </IconContext.Provider>
        </ButtonContainer>
      )}
    </ListItem>
  );
};
