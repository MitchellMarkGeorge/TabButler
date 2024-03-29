import React from "react";
import { HistoryData } from "@common/types";
import { ListItemProps } from "./ListItem";
import  formatDistanceToNow  from "date-fns/formatDistanceToNow";
import { useScroll } from "../../hooks";
import Image from "../Image";
import { getFaviconURL } from "./utils";
import { BsGlobe } from "react-icons/bs";

export const HistoryListItem = ({
  data,
  onHover,
  selected,
  onClick,
}: ListItemProps<HistoryData>) => {
  const ref = useScroll(selected);
  const FallBackIcon = <BsGlobe className="list-item-icon" />;

  const getHumanTime = (time: number) => {
    // need to use native relative time
    return `${formatDistanceToNow(time)} ago`;
  };
  return (
    <div
      className={selected ? "list-item-selected" : "list-item"}
      onClick={() => onClick(data)}
      onMouseOver={onHover}
      ref={ref}
    >
      <Image
        fallbackIcon={FallBackIcon}
        src={getFaviconURL(data.url)}
        className="list-item-image"
      />
      <div className="list-item-text">
        <div className="list-item-title text-sm">{data.title}</div>
        <div className="list-item-subtitle text-xs">
          {getHumanTime(data.timeVisited)}
        </div>
      </div>
    </div>
  );
};
