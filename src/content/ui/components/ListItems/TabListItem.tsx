import React from "react";
import Image from "../Image";
import { TabData } from "@common/types";

import { getHostname } from "./utls";
import { GlobeAmericasIcon } from "@heroicons/react/24/solid";
import { ListItemProps } from "./ListItem";
import { useScroll } from "../../hooks";

export const TabListItem = ({
  data,
  onHover,
  selected,
}: ListItemProps<TabData>) => {
  const ref = useScroll(selected);
  return (
    <div
      className={selected ? "list-item-selected" : "list-item"}
      // onClick={() => onClick(data)}
      onMouseOver={onHover}
      ref={ref}
    >
      <Image
        className="list-item-icon"
        src={data.favIcon}
        fallbackIcon={GlobeAmericasIcon}
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
