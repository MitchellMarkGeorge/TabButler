import React from "react";
import { BookmarkData } from "@common/types";
import { ListItemProps } from "./ListItem";
import { StarIcon } from "@heroicons/react/24/outline";
import { getHostname } from "./utls";

export const BookmarkListItem = ({
  data,
  onHover,
  selected,
}: ListItemProps<BookmarkData>) => {
  return (
    <div
      className={selected ? "list-item-selected" : "list-item"}
      // onClick={() => onClick(data)}
      onMouseOver={onHover}
    >
      <StarIcon className="list-item-icon" />
      <div className="list-item-text">
        <div className="list-item-title text-sm">{data.title}</div>
        <div className="list-item-subtitle text-xs">
          {getHostname(data.url)}
        </div>
      </div>
    </div>
  );
};
