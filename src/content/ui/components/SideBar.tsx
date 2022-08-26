import React from "react";
import { sideBarItems } from "../services/sidebar";
import { useSearchModalContext } from "./SearchModalContext";

export const SideBar = () => {
  const { currentSearchMode, setCurrentSearchMode, setIsLoading } =
    useSearchModalContext();
  return (
    <div className="side-bar">
      {sideBarItems.map(({ searchMode, icon: Icon }) => {
        const isSelected = currentSearchMode === searchMode;
        return (
          <div
            className={isSelected ? "side-bar-item-selected" : "side-bar-item"}
            onClick={() => {
              // MUST be batched together
              if (!isSelected) {
                setIsLoading(true);
                setCurrentSearchMode(searchMode);
              }
            }}
          >
            {/* can do styling from scss              */}
            <Icon
              size="32px"
              color={isSelected ? "#fff" : "rgba(255, 255, 255, 0.36)"}
            />
          </div>
        );
      })}
    </div>
  );
};
