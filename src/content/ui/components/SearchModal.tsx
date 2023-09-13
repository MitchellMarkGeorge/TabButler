// import createCache from "@emotion/cache";
// import { CacheProvider, css, Global } from "@emotion/react";
import React, { ElementRef, useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/styles.scss?inline";
import SearchBar from "./SearchBar";
// import NoResults from "./NoResults";
import Section from "./Section";
import {
  ActionData,
  BookmarkData,
  Data,
  DataType,
  HistoryData,
  ScoredDataType,
  SectionType,
  TabData,
} from "@common/types";
import { ActionListItem } from "./ListItems/ActionListItem";
import { BottomBar } from "./BottomBar";
import { TabListItem } from "./ListItems/TabListItem";
import debounce from "lodash.debounce";
import { search } from "../services/search";
import { HistoryListItem } from "./ListItems/HistoryListItem";
import { BookmarkListItem } from "./ListItems/BookmarkListItem";
import Error from "./Error";
import NoResults from "./NoResults";
import { onActionItemClick } from "../services/actions";
import { onTabItemClick } from "../services/tabs";
import { onHistoryItemClick } from "../services/history";
import { onBookmarkItemClick } from "../services/bookmarks";
// import { action } from "webextension-polyfill";
// import Error from "./Error";

export interface Props {
  close: () => void;
}
// const actions: ActionData[] = [
//   {
//     name: "New Tab",
//     icon: PlusIcon,
//     type: DataType.ACTION,
//     id: nanoid(),
//   },
//   {
//     name: "New Window",
//     icon: FolderPlusIcon,
//     type: DataType.ACTION,
//     id: nanoid(),
//   },
//   {
//     name: "Close tab",
//     icon: XMarkIcon,
//     type: DataType.ACTION,
//     id: nanoid(),
//   },
// ];

// const tabs: TabData[] = [
//   {
//     favIcon: null,
//     type: DataType.TAB,
//     tabId: 909,
//     title: "Test",
//     url: "https://test.com",
//     windowId: 0,
//     id: nanoid(),
//   },

//   {
//     favIcon: null,
//     type: DataType.TAB,
//     tabId: 909,
//     title: "Test",
//     url: "https://test.com",
//     windowId: 0,
//     id: nanoid(),
//   },

//   {
//     favIcon: null,
//     type: DataType.TAB,
//     tabId: 909,
//     title: "Test",
//     url: "https://test.com",
//     windowId: 0,
//     id: nanoid(),
//   },
// ];

// const results: SectionType[] = [
//   {
//     name: "Tabs",
//     items: tabs,
//     matchScore: 0.9,
//   },

//   {
//     name: "Actions",
//     items: actions,
//     matchScore: 0.72,
//   },
// ];

// alternative to the style tag is a link tag with the chrome url to transpiled style sheet
// i could also use jss https://cssinjs.org/setup?v=v10.9.2

export const SearchModal = (props: Props) => {
  // focus trap
  // const [searchQuery, setSearchQuery] = useState("");
  // might need to rethink this (need an easy way to access the actual items and their ids)
  // but for now having a seperate id array and id-dataItem map works
  const [resultSections, setResultSections] = useState<SectionType[] | null>(
    null,
  ); // sorted array of sections
  const [resultList, setResultList] = useState<ScoredDataType[] | null>(null);
  const [hasError, setError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const indexOfSelected = useMemo(() => {
    if (resultList && selectedId) {
      const foundId = resultList.findIndex(
        ({ data }) => data.id === selectedId,
      );
      return foundId === -1 ? null : foundId;
    } else return null;
  }, [selectedId]);

  const inputRef = useRef<ElementRef<"input">>(null);

  useEffect(() => {
    // focus the input on mount
    inputRef.current?.focus();
  }, []);

  // think about this - perfomance implecations and general readability
  // this should return a sorted list of all the id of the items (sorted by score)
  // const sortedIdList = useMemo(
  //   () =>
  //     resultSections
  //       .map((section) => section.items.map(({ data }) => data.id))
  //       .flat(),
  //   [resultSections],
  // );
  // console.log(sortedIdList);

  // think about this - perfomance implecations and general readability
  // const buildItemIdMap = () => {
  //   const items = resultSections.map((section) => section.items).flat();
  //   console.log(items);
  //   const itemIdMap = new Map();
  //   items.forEach(({ data }) => {
  //     itemIdMap.set(data.id, data);
  //   });
  //   return itemIdMap;
  // };

  // const itemIdMap = useMemo(buildItemIdMap, [resultSections]);
  const onSubmit = (data: Data) => {
    if (data.type === DataType.TAB) {
      onTabItemClick(data as TabData)
    } else if (data.type === DataType.ACTION) {
      onActionItemClick(data as ActionData);
    } else if (data.type === DataType.BOOKMARK) {
      onBookmarkItemClick(data as BookmarkData);
    } else if (data.type === DataType.HISTORY) {
      onHistoryItemClick(data as HistoryData);
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    // circular navigation might confuse users
    let nextIndex = 0;
    // const selectedListIdIndex = sortedIdList.indexOf(selectedId);
    if (resultList === null || indexOfSelected === null) return;
    // using tab caused some issues
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (indexOfSelected !== 0) {
        nextIndex = indexOfSelected - 1;
        setSelectedId(resultList[nextIndex].data.id);
      } else {
        nextIndex = resultList.length - 1;
        setSelectedId(resultList[nextIndex].data.id);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (indexOfSelected !== resultList.length - 1) {
        nextIndex = indexOfSelected + 1;
        setSelectedId(resultList[nextIndex].data.id);
      } else {
        nextIndex = 0;
        setSelectedId(resultList[nextIndex].data.id);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      const data = resultList[indexOfSelected].data;
      console.log(data);
      onSubmit(data);
      props.close()
    }
  };

  const closeOnEscape = (event: KeyboardEvent) => {
    // this is neccessary to stop some sites from preventing some key strokes from being registered
    event.stopPropagation();
    if (event.key === "Escape") {
      props.close();
    }
  };

  const addListeners = () => {
    document.addEventListener("keydown", closeOnEscape, true);
    // should this be keydown? with behaviour as smooth, navigation is a bit less performant and the selection can go out of view
    document.addEventListener("keydown", onKeyDown, true);
  };

  const removeListeners = () => {
    document.removeEventListener("keydown", closeOnEscape, true);
    document.removeEventListener("keydown", onKeyDown, true);
  };

  useEffect(() => {
    addListeners();
    return removeListeners;
  });

  const renderBody = () => {
    if (hasError) return <Error />;
    if (resultSections === null) return null;
    if (resultSections.length === 0) return <NoResults searchQuery={inputRef.current?.value || ""}/>; // for now
    return (
      <>
        {renderSections(resultSections)}
        <BottomBar />
      </>
    );
  };

  const renderSections = (sections: SectionType[]) => {
    return (
      <div className="section-list">
        {sections.map((section) => (
          <Section name={section.name} key={section.name}>
            {section.items.map(({ data }) => {
              if (data.type === DataType.ACTION) {
                return (
                  <ActionListItem
                    key={data.id}
                    data={data as ActionData}
                    onHover={() => setSelectedId(data.id)}
                    selected={selectedId === data.id}
                    onClick={onClickFactory(onActionItemClick)}
                  />
                );
              } else if (data.type === DataType.TAB) {
                return (
                  <TabListItem
                    key={data.id}
                    data={data as TabData}
                    onHover={() => setSelectedId(data.id)}
                    selected={selectedId === data.id}
                    onClick={onClickFactory(onTabItemClick)}
                  />
                );
              } else if (data.type === DataType.HISTORY) {
                return (
                  <HistoryListItem
                    key={data.id}
                    data={data as HistoryData}
                    onHover={() => setSelectedId(data.id)}
                    selected={selectedId === data.id}
                    onClick={onClickFactory(onHistoryItemClick)}
                  />
                );
              } else if (data.type === DataType.BOOKMARK) {
                return (
                  <BookmarkListItem
                    key={data.id}
                    data={data as BookmarkData}
                    onHover={() => setSelectedId(data.id)}
                    selected={selectedId === data.id}
                    onClick={onClickFactory(onBookmarkItemClick)}
                  />
                );
              }
            })}
          </Section>
        ))}
      </div>
    );
  };

  const onInputChange = debounce((query: string) => {
    if (query) {
      search(query)
        .then((result) => {
          // if the the input is currently empty, dont try and and set the result/render an error
          if (!inputRef.current?.value) return;
          console.log(result);
          if (result.hasError) {
            setError(true);
          } else if (result.data !== null) {
            console.log(result.data);
            const { sections, sortedResult } = result.data;
            setResultSections(sections);
            setResultList(sortedResult);
            // select the first item
            if (sortedResult.length === 0) {
              setSelectedId(null);
            } else {
              setSelectedId(sortedResult[0].data.id);
            }
            // result.data && setResultSections(result.data);
          }
        })
        .catch((err) => {
          console.log("here is the err", err);
          console.log("here in the catch");
          setError(true);
        });
    }
  }, 300);

  const onClickFactory = <T,>(func: (data: T) => void) => {
    return (data: T) => {
      func(data);
      props.close();
    }
  }
  return (
    <>
      <style>{styles}</style>
      <div className="modal-body">
        <SearchBar
          ref={inputRef}
          onChange={(query) => {
            // think about this
            if (!query) {
              setResultSections(null);
            } else {
              onInputChange(query);
            }
          }}
        />
        {renderBody()}
        {/* {resultSections.length > 0 && (
          <>
            <div className="section-list">{renderSections(resultSections)}</div>
            <BottomBar />
          </>
        )} */}
      </div>
    </>
  );
};
