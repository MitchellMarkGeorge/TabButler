import React, { useContext, useEffect } from "react";
import {
  ActionData,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
  UpdatedTabDataPayload,
} from "../../common/types";
import { useData } from "./hooks";
import {
  SearchModalContext,
  SearchModalContextType,
} from "./SearchModalContext";
import browser from "webextension-polyfill";
import { filterActions, filterTabs } from "../filters";
import { ActionListItem } from "./ListItems/ActionListItem";
import { TabListItem } from "./ListItems/TabListItem";
import { SearchView } from "./SearchView";
import { onActionItemClick, onTabItemClick } from "../utils";

export const SearchViewContainer = () => {
  const { currentSearchMode, isLoading } = useContext(
    SearchModalContext,
  ) as SearchModalContextType;
  const { hasError, data, updateData, fetchData } = useData(currentSearchMode);

  const updateTabDataListener = (messagePayLoad: MessagePlayload) => {
    const { message } = messagePayLoad;
    if (message === Message.TAB_DATA_UPDATE) {
      const { updatedTabData } = messagePayLoad as UpdatedTabDataPayload;
      // just update the data
      updateData(updatedTabData);
    }
  };

  const onVisibilityChange = () => {
    // this is called only when the page was once not visible (like the user whent to another tab) and it has become visible again.
    if (
      document.visibilityState === "visible" &&
      currentSearchMode === SearchMode.TAB_SEARCH
    ) {
      // if the document is now visible and was previously inactive and a tab search modal was open
      // get the updated tab data
      fetchData();
    }
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange, false);
    if (currentSearchMode === SearchMode.TAB_SEARCH) {
      browser.runtime.onMessage.addListener(updateTabDataListener);
    }

    return () => {
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
        false,
      );
      if (
        currentSearchMode === SearchMode.TAB_SEARCH &&
        browser.runtime.onMessage.hasListener(updateTabDataListener)
      ) {
        browser.runtime.onMessage.removeListener(updateTabDataListener);
      }
    };
  });

  const showSearchView = () => {
    switch (currentSearchMode) {
      case SearchMode.TAB_ACTIONS:
        return (
          <SearchView
            data={data as ActionData[]}
            inputPlaceHolderText="Search Actions..."
            noDataText="No actions to show"
            filterData={filterActions}
            onItemClick={onActionItemClick}
            listItemComponent={ActionListItem}
          />
        );

      case SearchMode.TAB_SEARCH:
        return (
          <SearchView
            data={data as TabData[]}
            inputPlaceHolderText="Search Tabs..."
            noDataText="No tabs to show"
            filterData={filterTabs}
            onItemClick={onTabItemClick}
            listItemComponent={TabListItem}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="tab-butler-empty">
        <h1 className="tab-butler-heading">Loading...</h1>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="tab-butler-empty">
        <div className="tab-butler-error-message">
          {/* for now */}
          <h1 className="tab-butler-heading">Error</h1>
          <h1 className="tab-butler-heading">
            Try reloading the current tab or restarting your browser.
          </h1>
        </div>
      </div>
    );
  }

  console.log("rendering data");
  return showSearchView();
};
