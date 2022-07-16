import styled from "@emotion/styled";
import React from "react";
import { SearchMode } from "../../common/types";
import { Kbd } from "./Kbd";

const BottomBarContainer = styled.div`
  /* it seems it increasd height? */
  height: 20px;
  /* min-height: 20px; */
  /* max-height: 20px; */
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

  .help_items,
  .bottom_info {
    display: flex;
    align-items: center;
    flex-direction: row;
    column-gap: 8px;
  }

  .bottom_info {
    font-size: 12px;
    font-weight: 450;
  }

  .bottom_info input {
    margin: 0;
  }

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.48);
  }
`;

interface Props {
  currentSeachMode: SearchMode;
  resultNum: number;
  showOnlyCurrentWindow: boolean;
  toggleShowOnlyCurrentWindow: () => void;
}
export default function BottomBar({
  currentSeachMode,
  resultNum,
  showOnlyCurrentWindow,
  toggleShowOnlyCurrentWindow,
}: Props) {
  return (
    <BottomBarContainer>
      <div className="bottom_info">
        <span>{resultNum} Results</span>
        {currentSeachMode === SearchMode.TAB_SEARCH && (
          <>
            <input
              type="checkbox"
              checked={showOnlyCurrentWindow}
              onChange={toggleShowOnlyCurrentWindow}
            />
            <label>In current window</label>
          </>
        )}
      </div>
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
          {currentSeachMode === SearchMode.TAB_ACTIONS
            ? "Execute action"
            : "Go to tab"}
        </div>

        <div>
          <Kbd>Esc</Kbd>
          Close
        </div>
      </div>
    </BottomBarContainer>
  );
}
