import React from "react";
import { ActionData } from "@common/types";
// import { useIsDarkMode } from "../../hooks";
import { ListItemProps } from "./ListItem";

export const ActionListItem = ({
  data,
  // onClick,
  onHover,
  selected,
}: ListItemProps<ActionData>) => {
  const Icon = data.icon;
  return (
    <div className={selected ? "list-item-selected" : "list-item"}
      // onClick={() => onClick(data)}
      onMouseOver={onHover}
    >
        <Icon
          className="list-item-icon"
        />
        <div className="list-item-text">
          <div className="list-item-title text-sm">{data.name}</div>
          <div className="list-item-subtitle text-xs">{data.name}</div>
        </div>
      </div>
  );
};
