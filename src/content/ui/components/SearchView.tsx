import FocusTrap from "focus-trap-react";
import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Data, SearchMode } from "@common/types";
import { BottomBar } from "./BottomBar";
import { ListItemProps } from "./ListItems/ListItem";
import {
  SearchModalContext,
  SearchModalContextType,
} from "./SearchModalContext";
import { AiOutlineSearch } from "@react-icons/all-files/ai/AiOutlineSearch";

interface Props<T> {
  // currentSearchMode: SearchMode;
  data: T[];
  inputPlaceHolderText: string;
  noDataText: string;
  filterData: (
    searchValue: string,
    data: T[],
    onlyCurrentWindow: boolean,
  ) => T[];
  onItemClick: (item: T) => void;
  listItemComponent: React.FC<ListItemProps<T>>;
}

export const SearchView = <T extends Data>(props: Props<T>) => {
  // would be better to just pass in in a prop to reduce unneccesary rerenders
  const { currentSearchMode, close } = useContext(
    SearchModalContext,
  ) as SearchModalContextType;
  const [value, setValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  const onSubmit = () => {
    // rename this method
    const selectedData = filteredData[selectedIndex];
    if (selectedData) {
      onItemClick(selectedData);
    }
  };

  // const isTabActionsMode = () =>
  //   props.currentSearchMode === SearchMode.TAB_ACTIONS;
  // const isTabSearchMode = () => currentSearchMode === SearchMode.TAB_SEARCH;

  useEffect(() => {
    if (value) {
      setValue("");
    }

    if (selectedIndex !== 0) {
      setSelectedIndex(0);
    }

    if (showOnlyCurrentWindow) {
      toggleShowOnlyCurrentWindow();
    }
    inputRef.current?.focus();
  }, [currentSearchMode]);
  // useEffect(() => {
  //   inputRef.current?.focus();
  // }, [])

  const filteredData = useMemo(
    () => props.filterData(value, props.data, showOnlyCurrentWindow),
    [value, props.data, showOnlyCurrentWindow],
  );

  const onKeyUp = (event: KeyboardEvent) => {
    // circular navigation might confuse users
    let nextIndex = 0;
    // using tab caused some issues
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
      close();
    }
  };

  const addListeners = () => {
    document.addEventListener("keydown", unmountOnEscape, true);
    // should this be keydown? with behaviour as smooth, navigation is a bit less performant and the selection can go out of view
    document.addEventListener("keyup", onKeyUp, true);
  };

  const removeListeners = () => {
    document.removeEventListener("keydown", unmountOnEscape, true);
    document.removeEventListener("keyup", onKeyUp, true);
  };

  useEffect(() => {
    addListeners();
    return removeListeners;
  });

  const onItemClick = (data: Data) => {
    props.onItemClick(data as T);
    close();
  };

  const showList = () => {
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
            onClick={onItemClick}
            data={item}
            onHover={() => setSelectedIndex(index)}
            selected={selectedIndex === index}
            key={index} // use id?
          />
        )}
      />
    );
  };

  return (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
      <div className="tab-butler-main-container">
        <div className="tab-butler-input-container">
          {/* think about this*/}
          <AiOutlineSearch className="search-icon" />
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
        </div>
        <div className="tab-butler-list-container">{showList()}</div>
        <BottomBar
          currentSeachMode={currentSearchMode}
          showOnlyCurrentWindow={showOnlyCurrentWindow}
          toggleShowOnlyCurrentWindow={toggleShowOnlyCurrentWindow}
          resultNum={filteredData.length}
        />
      </div>
    </FocusTrap>
  );
};
