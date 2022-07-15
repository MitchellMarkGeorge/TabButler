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
import { FixedSizeList } from "react-window";

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

  useEffect(() => {
    // useEffect to wait for ref to be avalible
    // make sure the needed values are avalible
    // console.log(dataListElementRef.current?.getBoundingClientRect().height)
    if (
      dataListElementRef.current?.clientHeight &&
      dataListElementRef.current?.clientWidth
    ) {
      setIsLoading(false); // shou
    } else {
      // should it error out?
    }
  }, []);

  // only change data when search mode changes
  const data = useMemo(() => {
    if (isTabActionsMode()) {
      return (props as TabActionsProps).actions;
    } else {
      return (props as TabSearchProps).currentTabs;
    }
  }, [props.searchMode, (props as TabSearchProps).currentTabs]);

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
    // cant use circular navigation because of virtualization
    // plus it might confuse users
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (selectedIndex !== 0) {
        setSelectedIndex((selectectedIndex) => selectectedIndex - 1);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (selectedIndex !== filteredData.length - 1) {
        setSelectedIndex((selectectedIndex) => selectectedIndex + 1);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  });

  // only filter the data when either the data or value changes
  const filteredData = useMemo(() => filterData(), [value, data]);

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
    // at this point we know that the height and width are avalible
    // we are using tis ref as 
    const { clientHeight: height, clientWidth: width } =
      dataListElementRef.current!;
    return (
      <FixedSizeList
        height={height}
        width={width}
        itemCount={filteredData.length}
        itemSize={50}
        itemData={filteredData}
        className="tab-butler-virtual-list"
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

  const showError = () => (
    <Empty>
      <div>
        <Heading>
          {`Unable to load your ${isTabActionsMode() ? "actions" : "tabs"}.`}
        </Heading>
        <Heading>
          Try reloading the current tab or restarting your browser.
        </Heading>
      </div>
    </Empty>
  );

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
            /* use system font (San Fransisco or Segoe UI) */
            /* disable scrollbar for virtualized list */
            .tab-butler-virtual-list::-webkit-scrollbar {
              display: none;
            }
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
              <DataList ref={dataListElementRef}>{showList()}</DataList>
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
