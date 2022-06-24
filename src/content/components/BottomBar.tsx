import styled from "@emotion/styled";
import React from "react";
import { Kbd } from "./Kbd";

const BottomBarContainer = styled.div`
  height: 20px;
  width: 100%;
  /* flex: none; */
  /* padding: 8px; */
  padding-left: 8px;
  padding-right: 8px;
  font-size: 10px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  /* column-gap: 8px; */
  color: rgba(255, 255, 255, 0.36);

  .help_items {
    display: flex;
    align-items: center;
    flex-direction: row;
    column-gap: 8px;
  }

  .result_num {
    font-size: 12px;
    font-weight: 450;
  }

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.48);
  }
`;

interface Props {
  isTabActionsMode: boolean;
  resultNum: number;
}
export default function BottomBar({ isTabActionsMode, resultNum }: Props) {
  return (
    <BottomBarContainer>
      <div className="result_num">{resultNum} Results</div>
      <div className="help_items">
        <div>
          <Kbd>&uarr;</Kbd>
          Up
        </div>

        <div>
          <Kbd>&darr;</Kbd>
          Down
        </div>

        <div>
          <Kbd>Enter</Kbd>
          {isTabActionsMode ? "Execute action" : "Go to tab"}
        </div>

        <div>
          <Kbd>Esc</Kbd>
          Close
        </div>
      </div>
    </BottomBarContainer>
  );
}
