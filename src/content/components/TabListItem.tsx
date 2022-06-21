import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";
import { TabData } from "../../common/types";
import { GlobeIcon } from "@heroicons/react/outline";
import { ListItem, ListItemProps } from "./ListItem";
import { useScroll } from "./hooks";




export const TabListItem = ({ data, onClick, selected }: ListItemProps<TabData>) => {
const ref = useScroll(selected);
  return (
    <ListItem
      onClick={() => onClick(data)}
      selected={selected}
      ref={ref}
    >
      {data.favIcon ? (
        <img src={data.favIcon} />
      ) : (
        <GlobeIcon
          width="24px"
          height="24px"
          color="rgba(255, 255, 255, 0.36)"
        />
      )}
      <div>{data.tabTitle}</div>
    </ListItem>
  );
};
