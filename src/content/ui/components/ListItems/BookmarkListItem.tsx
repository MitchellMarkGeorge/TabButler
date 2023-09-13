import React from "react";
import { BookmarkData } from "@common/types";
import { ListItemProps } from "./ListItem";
import { StarIcon } from "@heroicons/react/24/solid";
import { getFaviconURL, getHostname } from "./utils";
import { useScroll } from "../../hooks";
import Image from "../Image";
import { BsStarFill } from "react-icons/bs";

export const BookmarkListItem = ({
  data,
  onHover,
  onClick,
  selected,
}: ListItemProps<BookmarkData>) => {
  const ref = useScroll(selected);
  const FallBackIcon =  <BsStarFill className="list-item-star" />
  return (
    <div
      className={selected ? "list-item-selected" : "list-item"}
      onClick={() => onClick(data)}
      onMouseOver={onHover}
      ref={ref}
    >
      <Image fallbackIcon={FallBackIcon} src={getFaviconURL(data.url)} className="list-item-image" />
      <div className="list-item-text">
        <div className="list-item-title text-sm">{data.title}</div>
        <div className="list-item-subtitle text-xs">
          {getHostname(data.url)}
        </div>
      </div>
    </div>
  );
};
