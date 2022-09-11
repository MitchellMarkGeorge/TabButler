import React, { useEffect } from "react";
import {
  ActionData,
  HistoryData,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
  UpdatedTabDataPayload,
} from "@common/types";
import { useData } from "../hooks";
import { useSearchModalContext } from "./SearchModalContext";
import browser from "webextension-polyfill";
import { ActionListItem } from "./ListItems/ActionListItem";
import { TabListItem } from "./ListItems/TabListItem";
import { SearchView } from "./SearchView";
import { searchActions, onActionItemClick } from "../services/actions";
import { searchTabs, onTabItemClick } from "../services/tabs";
import { Empty, ErrorMessage, Heading } from "./utils";
import { onHistoryItemClick, searchHistory } from "../services/history";
import { HistoryListItem } from "./ListItems/HistoryListItem";

export const SearchViewContainer = () => {
  const { currentSearchMode } = useSearchModalContext();
  // could move all of the code from this function here
  const { hasError, data, updateData, fetchData, isLoading } =
    useData(currentSearchMode);

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
            searchData={searchActions}
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
            searchData={searchTabs}
            onItemClick={onTabItemClick}
            listItemComponent={TabListItem}
          />
        );
      case SearchMode.TAB_HISTORY:
        return (
          <SearchView
            data={data as HistoryData[]}
            inputPlaceHolderText="Search Recent History..."
            noDataText="No history to show"
            searchData={searchHistory}
            onItemClick={onHistoryItemClick}
            listItemComponent={HistoryListItem}
          />
        );
    }
  };

  if (isLoading) {
    console.log("loading...", data, currentSearchMode);
    return (
      <Empty>
        <Heading>Loading...</Heading>
      </Empty>
    );
  }

  if (hasError) {
    console.log("error...");
    return (
      <Empty>
        <ErrorMessage>
          <Heading>Error</Heading>
          <Heading>
            Try reloading the current tab or restarting your browser.
          </Heading>
        </ErrorMessage>
      </Empty>
    );
  }

  console.log("rendering stuff", currentSearchMode, data);
  return showSearchView();
};
