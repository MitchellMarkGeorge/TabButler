
import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";

export interface ListItemProps<T> {
  data: T
  selected: boolean;
  onClick: (data: T) => void
}

export const ListItem = styled.div<{ selected: boolean}>`
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
    user-select: none;
  }
`;