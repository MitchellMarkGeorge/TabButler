import React from "react";
import { SearchMode } from "@common/types";
import { createComponent } from "./utils";

const BottomBarContainer = createComponent({ className: "bottom-bar"});
const ResultNumberContainer = createComponent( { className: "result-number"});
const WindowToggleContainer = createComponent( { className: "window-toggle"});
const HelpItemContainer = createComponent( {className: "help-items"});

interface Props {
  currentSeachMode: SearchMode;
  resultNum: number;
  showOnlyCurrentWindow: boolean;
  toggleShowOnlyCurrentWindow: () => void;
}
export function BottomBar({
  currentSeachMode,
  resultNum,
  showOnlyCurrentWindow,
  toggleShowOnlyCurrentWindow,
}: Props) {
  return (
    <BottomBarContainer>
      {/* <span>{resultNum} Results</span> */}
      {/* what is the best way to do this? should I just cave in and show all the tabs by default? */}
      <ResultNumberContainer>
        <span>{resultNum} Results</span>
      </ResultNumberContainer>
      {currentSeachMode === SearchMode.TAB_SEARCH && (
        <WindowToggleContainer>
          <input
            type="checkbox"
            id="current-window-toggle"
            checked={showOnlyCurrentWindow}
            onChange={toggleShowOnlyCurrentWindow}
          />
          <label htmlFor="current-window-toggle">Only Current Window</label>
        </WindowToggleContainer>
      )}
      <HelpItemContainer>
        <div>
          <kbd >&uarr;</kbd>
          Up
        </div>

        <div>
          <kbd>&darr;</kbd>
          Down
        </div>

        <div>
          <kbd>Enter</kbd>
          {currentSeachMode === SearchMode.TAB_ACTIONS
            ? "Execute action"
            : "Go to tab"}
        </div>

        <div>
          <kbd>Esc</kbd>
          Close
        </div>
      </HelpItemContainer>
    </BottomBarContainer>
  );
}
