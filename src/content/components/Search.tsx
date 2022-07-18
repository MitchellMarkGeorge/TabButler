import createCache from "@emotion/cache";
import { CacheProvider, css, Global } from "@emotion/react";
import FocusTrap from "focus-trap-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import browser from "webextension-polyfill";
import {
  Action,
  ChangeTabMessagePayload,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
  UpdatedTabDataMessagePayload,
} from "../../common/types";
import { getActions } from "../actions";
import {
  filterActions,
  filterByCurrentWindow,
  filterTabs,
  getCurrentTabData,
} from "../utils";
import { ActionListItem } from "./ListItems/ActionListItem";
import { BottomBar } from "./BottomBar";
import { Container } from "./Container";
import { ListContainer } from "./ListContainer";
import { Empty } from "./Empty";
import { Heading } from "./Heading";
import { Input } from "./Input";
import { ModalBody } from "./ModalBody";
import { TabListItem } from "./ListItems/TabListItem";

export interface Props {
  shadowRoot: ShadowRoot;
  searchMode: SearchMode;
  close: () => void; // function to completely unmount the modal
}

export const Search = (props: Props) => {
  const [value, setValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOnlyCurrentWindow, setShowOnlyCurrentWindow] = useState(false);
  const [currentSearchMode, setCurrentSearchMode] = useState<SearchMode>(
    props.searchMode,
  ); // make the inital value the searchMode that was passed in
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Action[] | TabData[]>([]);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  // persist the cache between renders so new style tags are created when state changes
  const customCache = useRef(
    createCache({
      key: "tab-butler",
      container: props.shadowRoot,
    }),
  );

  const isTabActionsMode = () => currentSearchMode === SearchMode.TAB_ACTIONS;
  const isTabSearchMode = () => currentSearchMode === SearchMode.TAB_SEARCH;

  const fetchTabData = () => {
    getCurrentTabData()
      .then((results) => {
        setData(results);
        // will it be the correct value?
        if (isLoading) {
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        console.log(err);
        // will it be the correct value?
        if (isLoading) {
          setIsLoading(false);
        }
        setHasError(true);
      });
  };

  // all useEffect hooks are run on inital render

  useEffect(() => {
    // this is called on inital render
    // when received searchMode changes, reset some values
    if (!isLoading) {
      setIsLoading(true);
    }
    // update the current search mode

    // only update the currentSearchmode if the incomming searchMode from the props is not the same as the current one
    // on mount, the value of currentSearch mode is set from the props sho it should not be set again
    if (currentSearchMode !== props.searchMode) {
      setCurrentSearchMode(props.searchMode);
    }

    if (value) {
      setValue("");
    }
    if (selectedIndex !== 0) {
      setSelectedIndex(0);
    }

    if (currentSearchMode === SearchMode.TAB_ACTIONS && showOnlyCurrentWindow) {
      setShowOnlyCurrentWindow(false);
    }
  }, [props.searchMode]);

  useEffect(() => {
    // run on inital render
    // whenever currentSearchMode changes, get the associated data with that mode
    // need to wait for current search mode to be set

    // using currentSearchMode is needed (instead of just using props.searchMode) when the v1 ui is implmented
    // where the users will be able to change the current mode themselves using the ui.
    if (isTabActionsMode()) {
      setData(getActions());
      setIsLoading(false);
    } else {
      fetchTabData();
    }
  }, [currentSearchMode]);

  const filterData = () => {
    // first off, if it is in the tab search mode and showOnlyCurrentWindow is on, try and filter the data by the current winodow
    let initalData: TabData[] | Action[];
    if (isTabSearchMode() && showOnlyCurrentWindow) {
      initalData = filterByCurrentWindow(data as TabData[]);
    } else {
      initalData = data as Action[];
    }

    // then try and search the avalible data if there is a search value
    if (value) {
      if (isTabActionsMode()) {
        return filterActions(value, initalData as Action[]);
      }
      return filterTabs(value, initalData as TabData[]);
    } else {
      return initalData; // if there is no search query just return the data
    }
  };

  const onTabItemClick = (tabData: TabData) => {
    const messagePayload: ChangeTabMessagePayload = {
      message: Message.CHANGE_TAB,
      tabId: tabData.tabId,
      windowId: tabData.windowId,
    };
    browser.runtime.sendMessage(messagePayload);
    // shoud this be in the then clause?
    props.close();
  };

  const onActionItemClick = (action: Action) => {
    const messagePayload: MessagePlayload = {
      message: action.message,
    };
    browser.runtime.sendMessage(messagePayload);
    // shoud this be in the then clause?
    props.close();
  };

  const onSubmit = () => {
    // rename this method
    const selectedData = filteredData[selectedIndex];
    if (selectedData) {
      if (isTabActionsMode()) {
        onActionItemClick(selectedData as Action);
      } else {
        onTabItemClick(selectedData as TabData);
      }
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // circular navigation might confuse users
    let nextIndex = 0;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (selectedIndex !== 0) {
        nextIndex = selectedIndex - 1;
        virtuosoRef.current?.scrollIntoView({
          index: nextIndex,
          behavior: "smooth",
          done: () => {
            setSelectedIndex(nextIndex);
          },
        });
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (selectedIndex !== filteredData.length - 1) {
        nextIndex = selectedIndex + 1;
        virtuosoRef.current?.scrollIntoView({
          index: nextIndex,
          behavior: "smooth",
          done: () => {
            setSelectedIndex(nextIndex);
          },
        });
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  const unmountOnEscape = (event: KeyboardEvent) => {
    // this is neccessary to stop some sites from preventing some key strokes from being registered
    event.stopPropagation();
    if (event.key === "Escape") {
      props.close();
    }
  };

  const onVisibilityChange = () => {
    // this is called only when the page was once not visible (like the user whent to another tab) and it has become visible again.
    if (document.visibilityState === "visible" && isTabSearchMode()) {
      // if the document is now visible and was previously inactive and a tab search modal was open
      // get the updated tab data
      // if (!isLoading) {
      //   setIsLoading(true);
      // }
      // it should just update
      fetchTabData();
      // sometimes an error will be thrown here
      // this can happen if the context is invalidated (meaning that there has been an update and this tab is still trying to talk with the extension)
      // show error telling user to reload page
    }
  };

  const updateTabDataListener = (messagePayLoad: MessagePlayload) => {
    const { message } = messagePayLoad;
    if (message === Message.TAB_DATA_UPDATE) {
      console.log(messagePayLoad);
      const { updatedTabData } = messagePayLoad as UpdatedTabDataMessagePayload;
      // just update the data
      setData(updatedTabData);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", unmountOnEscape, true);
    document.addEventListener("visibilitychange", onVisibilityChange, false);
    document.addEventListener("keydown", onKeyDown, true);
    // conditionally add message listener for tab data updates (only in tab search mode)
    if (isTabSearchMode()) {
      browser.runtime.onMessage.addListener(updateTabDataListener);
    }
    return () => {
      document.removeEventListener("keydown", unmountOnEscape, true);
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
        false,
      );
      document.removeEventListener("keydown", onKeyDown, true);

      if (
        isTabSearchMode() && 
        browser.runtime.onMessage.hasListener(updateTabDataListener)
      ) {
        browser.runtime.onMessage.removeListener(updateTabDataListener);
      }
    };
  });

  // only filter the data when either the data , value, or showOnlyCurrentWindow option changes changes
  const filteredData = useMemo(
    () => filterData(),
    [value, data, showOnlyCurrentWindow],
  );

  const showList = () => {
    if (isLoading) {
      return (
        <Empty>
          <Heading>Loading...</Heading>
        </Empty>
      );
    }
    if (filteredData.length === 0) {
      return (
        <Empty>
          <Heading>
            {isTabActionsMode() ? "No actions to show" : "No tabs to show"}
          </Heading>
        </Empty>
      );
    }
    return (
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "100%", width: "100%" }} // move this to the virtial list class
        fixedItemHeight={50}
        totalCount={filteredData.length}
        className="tab-butler-virtual-list"
        itemContent={(index) => {
          const item = filteredData[index];
          return isTabActionsMode() ? (
            <ActionListItem
              onClick={onActionItemClick}
              data={item as Action}
              key={index}
              onHover={() => setSelectedIndex(index)}
              selected={selectedIndex === index}
            />
          ) : (
            <TabListItem
              onClick={onTabItemClick}
              data={item as TabData}
              key={(item as TabData).tabId}
              onHover={() => setSelectedIndex(index)}
              selected={selectedIndex === index}
            />
          );
        }}
      />
    );
  };

  const showError = () => (
    <Empty>
      <div>
        <Heading>
          {`Unable to show your ${isTabActionsMode() ? "actions" : "tabs"}.`}
        </Heading>
        <Heading>
          Try reloading the current tab or restarting your browser.
        </Heading>
      </div>
    </Empty>
  );

  const toggleShowOnlyCurrentWindow = () => {
    if (currentSearchMode === SearchMode.TAB_SEARCH) {
      setShowOnlyCurrentWindow((show) => !show);
    }
  };

  return (
    <CacheProvider value={customCache.current}>
      {/*  add all colors as variables       */}
      <Global
        styles={css`
          * {
            box-sizing: border-box !important;
            /* use system font (San Fransisco or Segoe UI) */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
            letter-spacing: normal !important;

            /* think about these */
            /* -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility; */
          }

          /* disable scrollbar for virtualized list */
          .tab-butler-virtual-list::-webkit-scrollbar {
            display: none;
          }
          /* disable scrollbar for firefox */
          .tab-butler-virtual-list {
            scrollbar-width: none;
          }
        `}
      />
      <ModalBody>
        {hasError ? (
          showError()
        ) : (
          /* allowing outside click to allow modal close */
          <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
            <Container>
              <Input
                placeholder={
                  isTabActionsMode() ? "Search Actions..." : "Search Tabs..."
                }
                value={value}
                autoFocus
                onChange={(e) => {
                  // reset selected to first element in search result
                  setSelectedIndex(0);
                  setValue(e.target.value);
                }}
              />
              <ListContainer>{showList()}</ListContainer>
              <BottomBar
                currentSeachMode={currentSearchMode}
                showOnlyCurrentWindow={showOnlyCurrentWindow}
                toggleShowOnlyCurrentWindow={toggleShowOnlyCurrentWindow}
                resultNum={filteredData.length}
              />
            </Container>
          </FocusTrap>
        )}
      </ModalBody>
    </CacheProvider>
  );
};