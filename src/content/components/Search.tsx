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
import { FixedSizeList } from "react-window";

// NOTE: SHOW URL IN TABDATA LIST ITEM
// should it be full url or just basename

// Add focus lock
// update tabData array props if tabs added/removed?
// this is important as tabs can be closed with the search open...
// Virtualization
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
  const dataListElementRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    })
  );

  useEffect(() => {
    // in the case of the search type changing, reset the input value and the selected index
    setValue("");
    setSelectedIndex(0);
  }, [props.searchMode]);

  useEffect(() => {
    // useEffect to wait for ref to be avalible
    // make sure the needed values are avalible
    // console.log(dataListElementRef.current?.getBoundingClientRect().height)
    if (
      dataListElementRef.current?.clientHeight &&
      dataListElementRef.current?.clientWidth
    ) {
      setIsLoading(false);
    }
  }, []);

  let data: Action[] | TabData[];
  if (props.searchMode === SearchMode.TAB_ACTIONS) {
    data = (props as TabActionsProps).actions;
  } else {
    data = (props as TabSearchProps).currentTabs;
  }

  const isTabActionsMode = () => props.searchMode === SearchMode.TAB_ACTIONS;
  const isTabSearchMode = () => props.searchMode === SearchMode.TAB_SEARCH;

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
      message: action.message,
    };
    console.log(messagePayload);
    chrome.runtime.sendMessage(messagePayload);
  };

  const onSubmit = () => {
    const selectedData = filteredData[selectedIndex];
    if (selectedData) {
      if (isTabActionsMode()) {
        onActionItemClick(selectedData as Action);
      } else {
        onTabItemClick(selectedData as TabData);
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
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  });

  let filteredData: Action[] | TabData[];

  if (isTabActionsMode()) {
    // https://beta.reactjs.org/learn/you-might-not-need-an-effect#caching-expensive-calculations
    filteredData = value ? filterActions(data as Action[]) : data;
  } else {
    filteredData = value ? filterTabs(data as TabData[]) : data;
  }

  const showList = () => {
    // at this point we know that the ref is avalible
    // this gets the (client) width and height of the container of the list (instead of using majic numbers or guessing)
    // this is also very usefull if I change the overall size of the modal
    // might be off (by like 0.38) but it is nothing noticeable
    const { clientHeight: height, clientWidth: width } = dataListElementRef.current!;
    return (
      <FixedSizeList
        height={height}
        width={width}
        itemCount={filteredData.length}
        itemSize={50}
        itemData={filteredData}
        className="tab_butler_virtual_list"
      >
        {({ index, style, data }) => {
          const item = data[index];
          return isTabActionsMode() ? (
            <ActionListItem
              onClick={onActionItemClick}
              data={item as Action}
              key={index}
              onHover={() => setSelectedIndex(index)}
              selected={selectedIndex === index}
              style={style}
            />
          ) : (
            <TabListItem
              onClick={onTabItemClick}
              data={item as TabData}
              key={index}
              onHover={() => setSelectedIndex(index)}
              selected={selectedIndex === index}
              style={style}
            />
          );
        }}
      </FixedSizeList>
    );
  };

  return (
    <CacheProvider value={customCache.current}>
      {/*  add all colors to variables       */}
      <Global
        styles={css`
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
          }

          /* disable scrollbar for virtualized list */
          .tab_butler_virtual_list::-webkit-scrollbar {
            display: none;
          }
        `}
      />
      {/* allowing outside click to only deactivate it  */}
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
        {/* with focus trap on, you cant click on the overlay to close it           */}
        <Container>
          <Input
            placeholder={
              isTabActionsMode() ? "Search Actions..." : "Search Tabs..."
            }
            value={value}
            autoFocus
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
          {filteredData.length === 0 ? (
            <Empty>
              <Heading>
                {isTabActionsMode() ? "No actions to show" : "No tabs to show"}
              </Heading>
            </Empty>
          ) : (
            <DataList ref={dataListElementRef}>
              {isLoading ? (
                // show loading if the ref is not avalible yet
                <Empty>
                  <Heading>Loading...</Heading>
                </Empty>
              ) : (
                showList()
              )}
            </DataList>
          )}
          <BottomBar
            isTabActionsMode={isTabActionsMode()}
            resultNum={filteredData.length}
          />
        </Container>
      </FocusTrap>
    </CacheProvider>
  );
};
