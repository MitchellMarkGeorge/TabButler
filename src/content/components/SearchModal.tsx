import createCache from "@emotion/cache";
import { CacheProvider, css, Global } from "@emotion/react";
import React, { useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";
import {
  ActionData,
  ChangeTabPayload,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
} from "../../common/types";
import { filterActions, filterTabs } from "../filters";
import { SearchView } from "./SearchView";
import { getActions } from "../actions";
import { ActionListItem } from "./ListItems/ActionListItem";
import { getCurrentTabData } from "../utils";
import { TabListItem } from "./ListItems/TabListItem";
import styles from "../styles/styles.scss"

export interface Props {
  shadowRoot: ShadowRoot;
  searchMode: SearchMode;
  close: () => void; // function to completely unmount the modal
}

export const SearchModal = (props: Props) => {
  const [currentSearchMode, setCurrentSearchMode] = useState<SearchMode>(
    props.searchMode,
  ); // make the inital value the searchMode that was passed in
  // persist the cache between renders so new style tags are not created when state changes
  const customCache = useRef(
    createCache({
      key: "tab-butler",
      container: props.shadowRoot,
    }),
  );

  useEffect(() => {
    // console.log("props.searchMode updated");
    // only update the currentSearchmode if the incomming searchMode from the props is not the same as the current one
    // on mount, the value of currentSearch mode is set from the props so it should not be set again
    if (currentSearchMode !== props.searchMode) {
      // console.log("setting currentSearchMode with props.searchMode");
      setCurrentSearchMode(props.searchMode);
    }
  }, [props.searchMode]);

  const onTabItemClick = (tabData: TabData) => {
    const messagePayload: ChangeTabPayload = {
      message: Message.CHANGE_TAB,
      tabId: tabData.tabId,
      windowId: tabData.windowId,
    };
    browser.runtime.sendMessage(messagePayload);
    // shoud this be in the then clause?
    props.close();
  };

  const onActionItemClick = (action: ActionData) => {
    const messagePayload: MessagePlayload = {
      message: action.message,
    };
    browser.runtime.sendMessage(messagePayload);
    // shoud this be in the then clause?
    props.close();
  };

  const showSearchView = () => {
    switch (currentSearchMode) {
      case SearchMode.TAB_ACTIONS:
        return ( // seperate into variables
          <SearchView
            currentSearchMode={currentSearchMode}
            close={props.close}
            inputPlaceHolderText="Search Actions..."
            errorText="Unable to show your actions"
            noDataText="No actions to show"
            filterData={filterActions}
            getData={getActions}
            onItemClick={onActionItemClick}
            listItemComponent={ActionListItem}
            // using key so a new component instance is created
            // better this way then trying to reset each state value every time the current search mode changes
            // every single prop will be changing anyway so its better to just rerender it completely then trying to monkey patch everything
            // most of the ui would need to be redrawn as well
            key={currentSearchMode}
          />
        );

      case SearchMode.TAB_SEARCH:
        return (
          <SearchView
            currentSearchMode={currentSearchMode}
            close={props.close}
            inputPlaceHolderText="Search Tabs..."
            errorText="Unable to show your tabs"
            noDataText="No tabs to show"
            filterData={filterTabs}
            getData={getCurrentTabData}
            onItemClick={onTabItemClick}
            listItemComponent={TabListItem}
            key={currentSearchMode}
          />
        );
    }
  };

  return (
    <CacheProvider value={customCache.current}>
      {/*  add all colors as variables       */}
      <>
      <style>{styles}</style>
      {showSearchView()}
      </>
    </CacheProvider>
  );
};
