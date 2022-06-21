import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";
import { TabData } from "../../common/types";
import { GlobeIcon } from "@heroicons/react/outline";

interface TabListItemProps {
  selected: boolean;
}

export const TabListItemContainer = styled.div<TabListItemProps>`
  width: 100%;
  /* height: 24px; */
  height: 50px;
  display: flex;
  flex-direction: row;
  row-gap: 8px;
  column-gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 10px;
  background-color: ${(props) => (props.selected ? "#3182ce" : "transparent")};

  :hover {
    background-color: #3182ce;
  }

  img {
    height: 24px;
    width: 24px;
  }

  div {
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
  }
`;

interface Props {
  tabData: TabData;
  onClick: (tabData: TabData) => void;
  selected: boolean;
}

export const TabListItem = ({ tabData, onClick, selected }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // if the item becomes selected, scroll to it
    if (selected) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [selected]);
  return (
    <TabListItemContainer
      onClick={() => onClick(tabData)}
      selected={selected}
      ref={ref}
    >
      {tabData.favIcon ? (
        <img src={tabData.favIcon} />
      ) : (
        <GlobeIcon
          width="24px"
          height="24px"
          color="rgba(255, 255, 255, 0.36)"
        />
      )}
      <div>{tabData.tabTitle}</div>
    </TabListItemContainer>
  );
};
