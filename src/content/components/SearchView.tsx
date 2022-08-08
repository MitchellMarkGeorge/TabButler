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

export const SearchView = <T extends Data>(props: Props<T>) => {
  const [value, setValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<T[]>([]);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showOnlyCurrentWindow, toggleShowOnlyCurrentWindow] = useReducer(
    (showOnlyCurrentWindow) => {
      virtuosoRef.current?.scrollIntoView({
        index: 0,
        done: () => {
          setSelectedIndex(0);
        },
      });
      // does is need ot return?
      return !showOnlyCurrentWindow;
    },
    false,
  );

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

  // const isTabActionsMode = () =>
  //   props.currentSearchMode === SearchMode.TAB_ACTIONS;
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
        <div className="tab-butler-empty">
          <h1 className="tab-butler-heading">Loading...</h1>
        </div>
      );
    }
    if (filteredData.length === 0) {
      return (
        <div className="tab-butler-empty">
          <h1 className="tab-butler-heading">{props.noDataText}</h1>
        </div>
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
    <div className="tab-butler-empty">
      <div className="tab-butler-error-message">
        <h1 className="tab-butler-heading">{props.errorText}</h1>
        <h1 className="tab-butler-heading">
          Try reloading the current tab or restarting your browser.
        </h1>
      </div>
    </div>
  );

  return (
    <div className="tab-butler-modal-body">
      {hasError ? (
        showError()
      ) : (
        // focus trap is needed so the input is still focused when the currentSearchMode changes
        <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
          <div className="tab-butler-main-container">
            <input
              className="tab-butler-input"
              placeholder={props.inputPlaceHolderText}
              value={value}
              ref={inputRef}
              onChange={(e) => {
                // reset selected to first element in search result
                setSelectedIndex(0);
                setValue(e.target.value);
              }}
            />
            <div className="tab-butler-list-container">{showList()}</div>
            <BottomBar
              currentSeachMode={props.currentSearchMode}
              showOnlyCurrentWindow={showOnlyCurrentWindow}
              toggleShowOnlyCurrentWindow={toggleShowOnlyCurrentWindow}
              resultNum={filteredData.length}
            />
          </div>
        </FocusTrap>
      )}
    </div>
  );
};
