import React from "react";
import { HistoryData } from "@common/types";
import { useIsDarkMode } from "../../hooks";
import {
  ListItem,
  ListItemProps,
  MainText,
  MainInfoContainer,
  SecondaryText,
  TextContainer,
} from "./ListItem";
import { FcGlobe } from "@react-icons/all-files/fc/FcGlobe";
import { getHostname } from "./utls";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const HistoryListItem = ({
  data,
  onClick,
  onHover,
  selected,
}: ListItemProps<HistoryData>) => {
  // const ref = useScroll(selected);
  // is it fine to be used like this???
  const isDarkMode = useIsDarkMode();

  const getHumanTime = (time: number) => {
    return dayjs(time).fromNow();
  }
  //   const Icon = data.icon;
  return (
    <ListItem
      onClick={() => onClick(data)}
      selected={selected}
      onMouseOver={onHover}
    >
      <MainInfoContainer>
        <FcGlobe
          size="24px"
          // what color should I use for history items
            color={isDarkMode ? "rgba(255, 255, 255, 0.36)" : "rgba(0, 0, 0, 0.36)"}
        //   color="#F6E05E" // need to think about this
        />
        <TextContainer>
          <MainText>{data.title}</MainText>
          <SecondaryText>
            {/* in case getHostname() returns an empty string */}
            {/* {data.url} */}
            {`${getHostname(data.url) || data.url} \u00b7 ${getHumanTime(data.timeVisited)}`}
          </SecondaryText>
        </TextContainer>
      </MainInfoContainer>
    </ListItem>
  );
};
