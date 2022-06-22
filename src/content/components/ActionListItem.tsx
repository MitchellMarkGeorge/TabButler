
import React, { useEffect, useRef } from "react";
import { Action, TabData } from "../../common/types";
import { ChipIcon } from "@heroicons/react/outline";
import { ListItem, ListItemProps } from "./ListItem";
import { useScroll } from "./hooks";




export const ActionListItem = ({ data, onClick, selected }: ListItemProps<Action>) => {
const ref = useScroll(selected)
  return (
    <ListItem
      onClick={() => onClick(data)}
      selected={selected}
      ref={ref}
    >
        <ChipIcon
          width="24px"
          height="24px"
          color="rgba(255, 255, 255, 0.36)"
        />
      
      <div className="main_text">{data.name}</div>
    </ListItem>
  );
};