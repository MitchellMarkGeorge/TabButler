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
  .bottom_info,
  .window_toggle {
    display: flex;
    align-items: center;
    flex-direction: row;
    column-gap: 8px;
  }

  .bottom_info,
  .window_toggle {
    font-size: 12px;
    font-weight: 450;
  }

  .window_toggle {
    column-gap: 4px;
  }

  .window_toggle label {
    cursor: pointer;
  }

  .window_toggle input {
    /* opacity: 0;
    position: absolute; */
    /* not sure about this */
    /* need to find way to style this checkbox */
    appearance: none;
    -moz-appearance: none;
    height: 14px;
    width: 14px;
    cursor: pointer;
    background-color: transparent;
    /* background-color: rgba(255, 255, 255, 0.36); */
    display: inline-block;
    line-height: 1;
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.36);
    margin: 0;
  }

  .window_toggle input:focus {
    outline: none;
  }

  .window_toggle input:checked {
    background-color: #3182ce;
    border: none;
  }
  .window_toggle input:checked::after {
    /* styule for the check mark */
    content: "\\2713";
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f7fafc;
    height: 100%;
    width: 100%;
  }

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.48);

    .window_toggle input {
      border: 1px solid rgba(0, 0, 0, 0.48);
    }
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
      {/* <span>{resultNum} Results</span> */}
      {/* what is the best way to do this? should I just cave in and show all the tabs by default? */}
      <div className="bottom_info">
        <span>{resultNum} Results</span>
      </div>
      {currentSeachMode === SearchMode.TAB_SEARCH && (
        <div className="window_toggle">
          <input
            type="checkbox"
            id="current_window_toggle"
            checked={showOnlyCurrentWindow}
            onChange={toggleShowOnlyCurrentWindow}
          />
          <label htmlFor="current_window_toggle">Only Current Window</label>
        </div>
      )}
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
