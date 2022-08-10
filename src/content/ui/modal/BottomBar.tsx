import React from "react";
import { SearchMode } from "../../../common/types";

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
    <div className="tab-butler-bottom-bar">
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
          <kbd className="tab-butler-kbd">&uarr;</kbd>
          Up
        </div>

        <div>
          <kbd className="tab-butler-kbd">&darr;</kbd>
          Down
        </div>

        <div>
          <kbd className="tab-butler-kbd">Enter</kbd>
          {currentSeachMode === SearchMode.TAB_ACTIONS
            ? "Execute action"
            : "Go to tab"}
        </div>

        <div>
          <kbd className="tab-butler-kbd">Esc</kbd>
          Close
        </div>
      </div>
    </div>
  );
}
