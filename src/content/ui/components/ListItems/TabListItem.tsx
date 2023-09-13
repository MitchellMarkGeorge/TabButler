import React from "react";
import Image from "../Image";
import { TabData } from "@common/types";

import { getHostname } from "./utils";
import { GlobeAmericasIcon } from "@heroicons/react/24/solid";
import { ListItemProps } from "./ListItem";
import { useScroll } from "../../hooks";
import { BsGlobeAmericas } from "react-icons/bs";

export const TabListItem = ({
  data,
  onHover,
  selected,
  onClick
}: ListItemProps<TabData>) => {
  const ref = useScroll(selected);
  const FallbackIcon = <BsGlobeAmericas className="list-item-icon"/>
  return (
    <div
      className={selected ? "list-item-selected" : "list-item"}
      onClick={() => onClick(data)}
      onMouseOver={onHover}
      ref={ref}
    >
      <Image
        className="list-item-icon"
        src={data.favIcon}
        fallbackIcon={FallbackIcon}
      />
      <div className="list-item-text">
        <div className="list-item-title text-sm">{data.title}</div>
        <div className="list-item-subtitle text-xs">
          {getHostname(data.url)}
        </div>
      </div>
    </div>
  );
};
