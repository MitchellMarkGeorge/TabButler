import createCache from "@emotion/cache";
import { CacheProvider, css, Global } from "@emotion/react";
import FocusTrap from "focus-trap-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import browser from "webextension-polyfill";
import {
  Action,
  ChangeTabPayload,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
  UpdatedTabDataPayload,
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

  // console.log("trying to render", data);
  // console.log("currentSearchMode on render", currentSearchMode)
  

  // create a SearchView component 
  // create a React Context for the close function, searchMode, setData


  // do we need a loading state?
  // using the 2 useEffects are fine for the the v1 ui where the currentSearchMode can be changed by the user, but here it isnt really needed
  // the problem here is that while on the first render the is fine, if the user tries to change to another mode, the props.currentMode will change
  // prompting a rerender
  // because the props.currentSearhMode has changed, the component would try to render the old data loaded from the previous mode using the ui of the ui compoenents of the new currentMode, causing an error

  // why does this solution work?? shouldn't it also try and render the wrong data? what is preventing it from rendering the wrong thing
  // I added some comments so you can get a sense of when everythink is called and with what specific state they have at that time
  // part of the reason that this solution works is that when the props.searchMode is updated, the currentSearchMode is still the old value, so it will still try and render the old data with the correct data,
  //instead of trying to render the old data with components related to the new props.searchMode

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
    // console.log("props.searchMode updated");
    // this is called on inital render
    // when received searchMode changes, reset some values

    // if (data.length > 0) {
    //   // another alternative to a loading state would be to simply reset the data to an empty array
    //  // this way all stale and "incorrect" data is completly cleared out and the only thing that can be rendered is an empty array
    //   setData([]);
    // }

    if (!isLoading) {
      // console.log("setting isLoading to true");
      setIsLoading(true);
    }
    // update the current search mode
    // only update the currentSearchmode if the incomming searchMode from the props is not the same as the current one
    // on mount, the value of currentSearch mode is set from the props so it should not be set again
    if (currentSearchMode !== props.searchMode) {
      // console.log("setting currentSearchMode with props.searchMode");
      setCurrentSearchMode(props.searchMode);
      // having a seperate useEffect for the currentSearchMOde is because it is not updated imediately
      // https://stackoverflow.com/questions/54069253/the-usestate-set-method-is-not-reflecting-a-change-immediately
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
    // console.log("currentSearchMode updated");
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
    const messagePayload: ChangeTabPayload = {
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
      // console.log(messagePayLoad);
      const { updatedTabData } = messagePayLoad as UpdatedTabDataPayload;
      // just update the data
      setData(updatedTabData);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", unmountOnEscape, true);
    // this listerner only needs to be added in TAB_SEARCH mode
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
    // doing this there in this case basically ignores any incorrect data that could be rendered 
    // and gives the useEffects the time to update the data 

    // the same thing can be acheived using an empty array (as described in useEffect) 
    // completely clearing the array in the long run might be safer than leaving the stale and incorrect data in state
    // and would also reduce us having to use another state value in the component
    // it would also simplify the some of the code in the currentSearchMode useEffect and in the fetchTabData method.
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
            /* things look slightly better with these selectors set */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
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
