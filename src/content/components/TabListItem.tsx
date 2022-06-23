import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";
import { TabData } from "../../common/types";
import { GlobeIcon } from "@heroicons/react/outline";
import { ListItem, ListItemProps } from "./ListItem";
import { useIsDarkMode, useScroll } from "./hooks";

export const TabListItem = ({
  data,
  onClick,
  selected,
}: ListItemProps<TabData>) => {
  const ref = useScroll(selected);
  // is it fine to be used like this???
  const isDarkMode = useIsDarkMode();

  const getHostname = (url: string) => {
    return new URL(url).hostname;
  };
  return (
    <ListItem onClick={() => onClick(data)} selected={selected} ref={ref}>
      {data.favIcon ? (
        <img src={data.favIcon} />
      ) : (
        <GlobeIcon
          width="24px"
          height="24px"
          color={
            isDarkMode ? "rgba(255, 255, 255, 0.36)" : "rgba(0, 0, 0, 0.36)"
          }
        />
      )}
      <div>
        <div className="main_text">{data.tabTitle}</div>
        <div className="secondary_text">{getHostname(data.tabUrl)}</div>
      </div>
    </ListItem>
  );
};
