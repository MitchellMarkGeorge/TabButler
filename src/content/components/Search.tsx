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

interface BaseProps {
  shadowRoot: ShadowRoot;
  searchMode: SearchMode;
  hasError: boolean;
  close: () => void; // function to completly unmount the modal
}
interface TabSearchProps extends BaseProps {
  currentTabs: TabData[];
}

interface TabActionsProps extends BaseProps {
  actions: Action[];
}

export type Props = TabActionsProps | TabSearchProps;

// tidy up this component
export const Search = (props: Props) => {
  const [value, setValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  // VERY IMPORTANT
  // this has to be in a ref so it is not recreated every rerender (when the state changes)
  // causing the cache provider to think the value has changed
  // leading to new style tags being inserted everytime the state changes
  // tldr; this is important because without it, new style tags will be inserted on every state change

  // persist the cache between renders
  const customCache = useRef(
    createCache({
      key: "tab-butler",
      container: props.shadowRoot,
    }),
  );

  const isTabActionsMode = () => props.searchMode === SearchMode.TAB_ACTIONS;
  // const isTabSearchMode = () => props.searchMode === SearchMode.TAB_SEARCH;

  useEffect(() => {
    // in the case of the search type changing, reset the input value and the selected index
    if (value) {
      setValue("");
    }
    if (selectedIndex !== 0) {
      setSelectedIndex(0);
    }
  }, [props.searchMode]);

  // let data: Action[] | TabData[];
  // only change when search mode changes
  const data = useMemo(() => {
    if (isTabActionsMode()) {
      return (props as TabActionsProps).actions;
    } else {
      return (props as TabSearchProps).currentTabs;
    }
  }, [props.searchMode, (props as TabSearchProps).currentTabs]);

  // if (props.searchMode === SearchMode.TAB_ACTIONS) {
  //   data = (props as TabActionsProps).actions;
  // } else {
  //   data = (props as TabSearchProps).currentTabs;
  // }

  const filterTabs = (currentTabs: TabData[]) => {
    return currentTabs.filter(
      (tabData) =>
        // try to filter based on the tab title and the tab url
        tabData.tabTitle.toLowerCase().includes(value.toLowerCase()) ||
        tabData.tabUrl.toLowerCase().includes(value.toLowerCase()),
    );
  };

  const filterActions = (actions: Action[]) => {
    return actions.filter((action) =>
      action.name.toLowerCase().includes(value.toLowerCase()),
    );
  };

  const filterData = () => {
    if (value) {
      if (isTabActionsMode()) {
        return filterActions(data as Action[]);
      }
      return filterTabs(data as TabData[]);
    } else {
      return data; // if there is no search query just return the data
    }
  };

  const onTabItemClick = (tabData: TabData) => {
    const messagePayload: ChangeTabMessagePayload = {
      message: Message.CHANGE_TAB,
      tabId: tabData.tabId,
    };
    browser.runtime.sendMessage(messagePayload);
    // shoud this be in the then clause?
    props.close();
  };

  const onActionItemClick = (action: Action) => {
    const messagePayload: MessagePlayload = {
      message: action.message,
    };
    console.log(messagePayload);
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
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (selectedIndex !== 0) {
        setSelectedIndex((selectectedIndex) => selectectedIndex - 1);
      } else {
        setSelectedIndex(filteredData.length - 1); // scroll to the buttom
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (selectedIndex !== filteredData.length - 1) {
        setSelectedIndex((selectectedIndex) => selectectedIndex + 1);
      } else {
        setSelectedIndex(0); // scroll up to the start
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    // can also use window
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  });

  const filteredData = useMemo(() => filterData(), [value, data]);

  const showList = () => {
    if (filteredData.length === 0) {
      return (
        <Empty>
          <Heading>
            {isTabActionsMode() ? "No actions to show" : "No tabs to show"}
          </Heading>
        </Empty>
      );
    }

    const listItems = new Array<JSX.Element>(filteredData.length);
    const listItemsNum = listItems.length;
    // do the list item compoenents need memoization?
    // look into using sections for things like bookmarks, history items, etc.
    if (isTabActionsMode()) {
      // change selected on mouse over
      const actions = filteredData as Action[];
      for (let i = 0; i < listItemsNum; i++) {
        listItems[i] = (
          <ActionListItem
            onClick={onActionItemClick}
            data={actions[i]}
            key={i}
            onHover={() => setSelectedIndex(i)}
            selected={selectedIndex === i}
          />
        );
      }
    } else {
      const tabData = filteredData as TabData[];
      for (let i = 0; i < listItemsNum; i++) {
        listItems[i] = (
          <TabListItem
            onClick={onTabItemClick}
            data={tabData[i]}
            key={tabData[i].tabId}
            onHover={() => setSelectedIndex(i)}
            selected={selectedIndex === i}
          />
        );
      }
    }

    return listItems;
  };

  const showError = () => (

          <Empty>
            <div>
              <Heading>
                {`Unable to load your ${
                  isTabActionsMode() ? "actions" : "tabs"
                }.`}
              </Heading>
              <Heading>Try reloading the current tab or restarting your browser.</Heading>
            </div>
          </Empty>
  )

  return (
    <CacheProvider value={customCache.current}>
      {/*  add all colors to variables       */}
      <Global
        styles={css`
          * {
            box-sizing: border-box !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
            letter-spacing: normal !important;
            /* remove firefox scroll bar */
            /* use system font (San Fransisco or Segoe UI) */
          }
        `}
      />
      <ModalBody>
        {props.hasError ? (
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
                isTabActionsMode={isTabActionsMode()}
                resultNum={filteredData.length}
              />
            </Container>
          </FocusTrap>
        )}
      </ModalBody>
    </CacheProvider>
  );
};
