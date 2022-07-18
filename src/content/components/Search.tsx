import React, { useEffect, useMemo, useRef, useState } from "react";
import createCache from "@emotion/cache";
import { CacheProvider, css, Global } from "@emotion/react";
import { Input } from "./Input";
import { Container } from "./Container";
import { DataList } from "./DataList";
import { Empty } from "./Empty";
import { Heading } from "./Heading";
import {
  Action,
  ChangeTabMessagePayload,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
} from "../../common/types";
import { TabListItem } from "./TabListItem";
import { ActionListItem } from "./ActionListItem";
import BottomBar from "./BottomBar";
import FocusTrap from "focus-trap-react";
import browser from "webextension-polyfill";
import { ModalBody } from "./ModalBody";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { getCurrentTabData } from "../utils";
import { getActions } from "../actions";

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

  useEffect(() => {
    if (!isLoading) {
      console.log("loading");
      setIsLoading(true);
    }
    // update the current search mode
    setCurrentSearchMode(props.searchMode);

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
    // need to wait for current search mode to be set
    if (isTabActionsMode()) {
      console.log("here");
      setData(getActions());
      setIsLoading(false);
    } else {
      console.log(currentSearchMode);
      getCurrentTabData()
        .then((results) => {
          setData(results);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          console.log(err);
          setIsLoading(false);
          setHasError(true);
        });
    }
  }, [currentSearchMode]);

  const filterByCurrentWindow = (currentTabs: TabData[]) => {
    return currentTabs.filter((tabData) => tabData.inCurrentWindow);
  };

  // only change data when search mode changes

  const tabMatchesValue = (tabData: TabData) =>
    tabData.tabTitle.toLowerCase().includes(value.toLowerCase()) ||
    tabData.tabUrl.toLowerCase().includes(value.toLowerCase());

  const filterTabs = (currentTabs: TabData[]) => {
    return currentTabs.filter(
      (tabData) => tabMatchesValue(tabData),
      // try to filter based on the tab title and the tab url
    );
  };

  const filterActions = (actions: Action[]) => {
    return actions.filter((action) =>
      action.name.toLowerCase().includes(value.toLowerCase()),
    );
  };

  const filterData = () => {
    // first off, if it is in the tab search mode, try and filter by by the current winodow (if applicable)
    let initalData: TabData[] | Action[];
    if (isTabSearchMode() && showOnlyCurrentWindow) {
      initalData = filterByCurrentWindow(data as TabData[]);
    } else {
      initalData = data as Action[];
    }

    // then try and search the avalible data if there is a search value
    if (value) {
      if (isTabActionsMode()) {
        return filterActions(initalData as Action[]);
      }
      return filterTabs(initalData as TabData[]);
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

  // need to make sure this works as intended
  const onKeyDown = (event: KeyboardEvent) => {
    // circular navigation might confuse users
    let nextIndex = 0;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (selectedIndex !== 0) {
        nextIndex = selectedIndex - 1;
        // ref.current.sc
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
    // think about this... do users want it to remain open once they leave a page
    // AS OF RIGHT NOW: if the user switch tabs using the modal (or any action), it should automatically close
    // if the user simply goes to another tab manually (like they usually would), it should stay open in case they still want to use it
    // this is called only when the page was once not visible (like the user whent to another tab) and it has become visible again.
    if (document.visibilityState === "visible" && isTabSearchMode()) {
      // if the document is now visible and was previously inactive and a tab search modal was open
      // get the updated tab data
      // should this be here??
      // isPageActive = true;
      // for some reason this event keeps throwing an Extension context invalidated error... this might
      // the probelem is that a potential previous content script is still trying to send this message
      // and since it has been "cut off" by the extension, it is invalidated
      // functionality still works, but might need a way to handle this
      // can probably make this into a promise like method
      // this is only a problem in devlopment due to the ammount of times we "update"/refresh the extension
      // in production, this might only happen if the user updates the extension and the old content script is stll there
      if (!isLoading) {
        setIsLoading(true);
      }

      getCurrentTabData()
        .then((updatedTabData) => {
          setData(updatedTabData);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setHasError(true);
          // this can happen if the context is invalidated (meaning that there has been an update and this tab is still trying to talk with the extension)
          // show error telling user to reload page
          // }
        });
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", unmountOnEscape, true);
    document.addEventListener("visibilitychange", onVisibilityChange, false);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", unmountOnEscape, true);
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
        false,
      );
      document.removeEventListener("keydown", onKeyDown, true);
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
              <DataList>{showList()}</DataList>
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
