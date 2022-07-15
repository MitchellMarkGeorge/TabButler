import React from "react";
import { Action } from "../../common/types";
import { ListItem, ListItemProps } from "./ListItem";
import { useIsDarkMode, useScroll } from "./hooks";

export const ActionListItem = ({
  data,
  onClick,
  onHover,
  selected,
  style,
}: ListItemProps<Action>) => {
  const ref = useScroll(selected);
  // is it fine to be used like this???
  const isDarkMode = useIsDarkMode();
  const Icon = data.icon;
  return (
    <ListItem
      style={style}
      onClick={() => onClick(data)}
      selected={selected}
      ref={ref}
      onMouseOver={onHover}
    >
      <Icon
        size="24px"
        color={
          data.iconColor
            ? data.iconColor
            : isDarkMode
            ? "rgba(255, 255, 255, 0.36)"
            : "rgba(0, 0, 0, 0.36)"
        }
      />
      <div className="main_text">{data.name}</div>
    </ListItem>
  );
};
