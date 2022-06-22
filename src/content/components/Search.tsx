import React, { useEffect, useRef, useState } from "react";
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

// NOTE: SHOW URL IN TABDATA LIST ITEM
// should it be full url or just basename

interface BaseProps {
  shadowRoot: ShadowRoot;
  searchMode: SearchMode;
}
interface TabSearchProps extends BaseProps {
  currentTabs: TabData[];
}

interface TabActionsProps extends BaseProps {
  actions: Action[];
}

type Props = TabActionsProps | TabSearchProps;

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
  const customCache = useRef(createCache({
    key: "tab-butler",
    container: props.shadowRoot,
  }));

  useEffect(() => {
    // in the case of the search type changing, reset the input value and the selected index
    setValue("")
    setSelectedIndex(0)
  }, [props.searchMode])

  let data: Action[] | TabData[];
  if (props.searchMode === SearchMode.TAB_ACTIONS) {
    data = (props as TabActionsProps).actions;
  } else {
    data = (props as TabSearchProps).currentTabs;
  }

  const isTabActions = () => props.searchMode === SearchMode.TAB_ACTIONS;
  const isTabSearch = () => props.searchMode === SearchMode.TAB_SEARCH;

  const filterTabs = (currentTabs: TabData[]) => {
    return currentTabs.filter(
      (tabData) =>
        // try to filter based on the tab title and the tab url
        tabData.tabTitle.toLowerCase().includes(value.toLowerCase()) ||
        tabData.tabUrl.toLowerCase().includes(value.toLowerCase())
    );
  };

  const filterActions = (actions: Action[]) => {
    return actions.filter((action) =>
      action.name.toLowerCase().includes(value.toLowerCase())
    );
  };

  const onTabItemClick = (tabData: TabData) => {
    const messagePayload: ChangeTabMessagePayload = {
      message: Message.CHANGE_TAB,
      tabId: tabData.tabId,
    };
    chrome.runtime.sendMessage(messagePayload);
  };

  const onActionItemClick = (action: Action) => {
    const messagePayload: MessagePlayload = {
        message: action.message
    }
    console.log(messagePayload);
    chrome.runtime.sendMessage(messagePayload);
  }

  const onSubmit = () => {
    const selectedData = filteredData[selectedIndex];
    if (selectedData) {
      if (isTabActions()) {
        onActionItemClick(selectedData as Action)
      } else {
        onTabItemClick(selectedData as TabData)
      }
    }
  };

  const onKeyDown = (event: any) => {
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
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  let filteredData: Action[] | TabData[];

  if (isTabActions()) {
    filteredData = value ? filterActions(data as Action[]) : data;
  } else {
    filteredData = value ? filterTabs(data as TabData[]) : data;
  }

  const showList = () => {
    if (isTabActions()) {
      return (filteredData as Action[]).map((action, index) => (
        <ActionListItem
          onClick={onActionItemClick}
          data={action}
          key={index}
          selected={selectedIndex === index}
        />
      ));
    } else {
      return (filteredData as TabData[]).map((tabData, index) => (
        <TabListItem
          onClick={onTabItemClick}
          data={tabData}
          key={tabData.tabId}
          selected={selectedIndex === index}
        />
      ));
    }
  };


  return (
    <CacheProvider value={customCache.current}>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
            font-family: system-ui, sans-serif;
          }
        `}
      />
      <Container>
        {/* this onsubmit only works if the inputr is focused... what if the input isnt focused???        */}
          <Input
            placeholder={
              isTabActions() ? "Search Actions..." : "Search Tabs..."
            }
            type="text"
            value={value}
            autoFocus
            onChange={(e) => {
              setSelectedIndex(0);
              setValue(e.target.value);
            }}
          />
        {filteredData.length === 0 ? (
          <Empty>
            <Heading color="rgba(255, 255, 255, 0.36)">
              {isTabActions() ? "No actions to show" : "No tabs to show"}
            </Heading>
          </Empty>
        ) : (
          <DataList>{showList()}</DataList>
        )}
      </Container>
    </CacheProvider>
  );
};
