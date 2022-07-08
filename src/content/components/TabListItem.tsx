import React, { useState } from "react";
import { TabData } from "../../common/types";
import { HiOutlineGlobe } from "@react-icons/all-files/hi/HiOutlineGlobe";
import { ListItem, ListItemProps } from "./ListItem";
import { useIsDarkMode, useScroll } from "./hooks";

export const TabListItem = ({
  data,
  onClick,
  onHover,
  selected,
}: ListItemProps<TabData>) => {
  const ref = useScroll(selected);
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
  return (
    <ListItem
      onClick={() => onClick(data)}
      selected={selected}
      ref={ref}
      onMouseOver={onHover}
    >
      {/* handle potential image error when trying to load favicon  */}
      {data.favIcon ? (
        hasImageError ? (
          getFallBackIcon()
        ) : (
          <img src={data.favIcon} onError={() => setHasImageError(true)} />
        )
      ) : (
        getFallBackIcon()
      )}
      <div className="text_container">
        <div className="main_text">{data.tabTitle}</div>
        {/* go getHostname() in the background script instead          */}
        <div className="secondary_text">{getHostname(data.tabUrl)}</div>
      </div>
    </ListItem>
  );
};
