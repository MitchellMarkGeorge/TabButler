import {
  Data,
  Message,
  MessagePlayload,
  SearchMode,
  UpdatedTabDataPayload,
} from "../../common/types";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import browser from "webextension-polyfill";
import { Empty } from "./Empty";
import { Heading } from "./Heading";
import { BottomBar } from "./BottomBar";
import { Container } from "./Container";
import { Input } from "./Input";
import { ListContainer } from "./ListContainer";
import { ModalBody } from "./ModalBody";
import { ListItemProps } from "./ListItems/ListItem";

interface Props<T> {
  currentSearchMode: SearchMode;
  inputPlaceHolderText: string;
  noDataText: string;
  errorText: string;
  getData: () => Promise<T[]>;
  filterData: (
    searchValue: string,
    data: T[],
    onlyCurrentWindow: boolean,
  ) => T[];
  onItemClick: (item: T) => void;
  close: () => void;
  listItemComponent: React.FC<ListItemProps<T>>;
}


export const SearchView =  <T extends Data>(props: Props<T>) =>  {
  const [value, setValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOnlyCurrentWindow, toggleShowOnlyCurrentWindow] = useReducer(
    (showOnlyCurrentWindow) => !showOnlyCurrentWindow,
    false,
  );
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<T[]>([]);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  
  const fetchData = () => {
    props
      .getData()
      .then((data) => {
        console.log(data);
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        setHasError(true);
      });
  };

  const onSubmit = () => {
    // rename this method
    const selectedData = filteredData[selectedIndex];
    if (selectedData) {
      props.onItemClick(selectedData);
    }
  };

  const isTabActionsMode = () =>
    props.currentSearchMode === SearchMode.TAB_ACTIONS;
  const isTabSearchMode = () =>
    props.currentSearchMode === SearchMode.TAB_SEARCH;

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(
    () => props.filterData(value, data, showOnlyCurrentWindow),
    [value, data, showOnlyCurrentWindow],
  );

  const onKeyDown = (event: KeyboardEvent) => {
    // circular navigation might confuse users
    let nextIndex = 0;
    if (event.key === "ArrowUp" || (event.shiftKey && event.key === "Tab")) {
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
    } else if (event.key === "ArrowDown" || event.key === "Tab") {
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
      fetchData();
    }
  };

  const updateTabDataListener = (messagePayLoad: MessagePlayload) => {
    const { message } = messagePayLoad;
    if (message === Message.TAB_DATA_UPDATE) {
      // console.log(messagePayLoad);
      const { updatedTabData } = messagePayLoad as UpdatedTabDataPayload;
      // just update the data
      setData(updatedTabData as T[]);
    }
  };

  const addListeners = () => {
    document.addEventListener("keydown", unmountOnEscape, true);
    // this listerner only needs to be added in TAB_SEARCH mode
    document.addEventListener("visibilitychange", onVisibilityChange, false);
    document.addEventListener("keydown", onKeyDown, true);
    // conditionally add message listener for tab data updates (only in tab search mode)
    if (isTabSearchMode()) {
      browser.runtime.onMessage.addListener(updateTabDataListener);
    }
  };

  const removeListeners = () => {
    document.removeEventListener("keydown", unmountOnEscape, true);
    document.removeEventListener("visibilitychange", onVisibilityChange, false);
    document.removeEventListener("keydown", onKeyDown, true);

    if (
      isTabSearchMode() &&
      browser.runtime.onMessage.hasListener(updateTabDataListener)
    ) {
      browser.runtime.onMessage.removeListener(updateTabDataListener);
    }
  };

  useEffect(() => {
    addListeners();
    return removeListeners;
  });

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
          <Heading>{props.noDataText}</Heading>
        </Empty>
      );
    }
    const ListItemComponent = props.listItemComponent;
    return (
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "100%", width: "100%" }} // move this to the virtial list class
        fixedItemHeight={50}
        data={filteredData}
        // totalCount={filteredData.length}
        className="tab-butler-virtual-list"
        itemContent={(index, item) => (
          <ListItemComponent
            onClick={props.onItemClick}
            data={item}
            onHover={() => setSelectedIndex(index)}
            selected={selectedIndex === index}
            key={index} // use id?
          />
        )}
      />
    );
  };

  const showError = () => (
    <Empty>
      <div>
        <Heading>{props.errorText}</Heading>
        <Heading>
          Try reloading the current tab or restarting your browser.
        </Heading>
      </div>
    </Empty>
  );

  return (
    <ModalBody>
      {hasError ? (
        showError()
      ) : (
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
            currentSeachMode={props.currentSearchMode}
            showOnlyCurrentWindow={showOnlyCurrentWindow}
            toggleShowOnlyCurrentWindow={toggleShowOnlyCurrentWindow}
            resultNum={filteredData.length}
          />
        </Container>
      )}
    </ModalBody>
  );
};

