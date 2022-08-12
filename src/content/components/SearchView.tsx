import FocusTrap from "focus-trap-react";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import browser from "webextension-polyfill";
import {
  Data,
  Message,
  MessagePlayload,
  SearchMode,
  UpdatedTabDataPayload,
} from "../../common/types";
import { BottomBar } from "./BottomBar";
import { Container } from "./Container";
import { Empty } from "./Empty";
import { Heading } from "./Heading";
import { Input } from "./Input";
import { ListContainer } from "./ListContainer";
import { ListItemProps } from "./ListItems/ListItem";
import { ModalBody } from "./ModalBody";

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

export const SearchView = <T extends Data>(props: Props<T>) => {
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
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    props
      .getData()
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch(() => {
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
    inputRef.current?.focus();
  }, []);

  const filteredData = useMemo(
    () => props.filterData(value, data, showOnlyCurrentWindow),
    [value, data, showOnlyCurrentWindow],
  );

  const onKeyUp = (event: KeyboardEvent) => {
    // circular navigation might confuse users
    // tab navigation causes navigation in onKeyUp
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
      fetchData();
    }
  };

  const updateTabDataListener = (messagePayLoad: MessagePlayload) => {
    const { message } = messagePayLoad;
    if (message === Message.TAB_DATA_UPDATE) {
      // console.log(messagePayLoad);
      const { updatedTabData } = messagePayLoad as UpdatedTabDataPayload;
      // for some reason of firefox, when a user closes a tab using the actual close functionality, it does not update the ui properly
      // the tab data sent from the background script is not up to date.
      // the onRemoved listener is called before the tab is removed, leading to it still being present in the array.
      // this is a bug in firefox that we have no control over
      console.log("received message", updatedTabData);
      // just update the data
      setData(updatedTabData as T[]);
    }
  };

  const addListeners = () => {
    document.addEventListener("keydown", unmountOnEscape, true);
    // this listerner only needs to be added in TAB_SEARCH mode
    document.addEventListener("visibilitychange", onVisibilityChange, false);
    document.addEventListener("keyup", onKeyUp, true);
    // conditionally add message listener for tab data updates (only in tab search mode)
    if (isTabSearchMode()) {
      browser.runtime.onMessage.addListener(updateTabDataListener);
    }
  };

  const removeListeners = () => {
    document.removeEventListener("keydown", unmountOnEscape, true);
    document.removeEventListener("visibilitychange", onVisibilityChange, false);
    document.removeEventListener("keyup", onKeyUp, true);

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
        // focus trap is needed so the input is still focused when the currentSearchMode changes
        <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
          <Container>
            <Input
              placeholder={
                isTabActionsMode() ? "Search Actions..." : "Search Tabs..."
              }
              value={value}
              ref={inputRef}
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
        </FocusTrap>
      )}
    </ModalBody>
  );
};
