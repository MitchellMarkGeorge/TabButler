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
import FocusTrap from "focus-trap-react";

export interface Props {
  close: () => void;
}
// alternative to the style tag is a link tag with the chrome url to transpiled style sheet
// i could also use jss https://cssinjs.org/setup?v=v10.9.2

export const SearchModal = (props: Props) => {
  const [resultSections, setResultSections] = useState<SectionType[] | null>(
    null,
  ); // sorted array of sections
  const [resultList, setResultList] = useState<ScoredDataType[] | null>(null); // sorted list of results
  const [hasError, setError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // get the index of the selected item in resultList
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

  const onSubmit = (data: Data) => {
    if (data.type === DataType.TAB) {
      onTabItemClick(data as TabData);
    } else if (data.type === DataType.ACTION) {
      onActionItemClick(data as ActionData);
    } else if (data.type === DataType.BOOKMARK) {
      onBookmarkItemClick(data as BookmarkData);
    } else if (data.type === DataType.HISTORY) {
      onHistoryItemClick(data as HistoryData);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // this is needed to prevent some sites from trying to overide the key
    event.stopPropagation();
    if (event.key === "Escape") {
      props.close();
      return;
    }
    let nextIndex = 0;
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
      // console.log(data);
      onSubmit(data);
      props.close();
    }
  };

  const renderBody = () => {
    if (hasError) return <Error />;
    if (resultSections === null) return null;
    // if there are no results you could render a section only for searching
    // this technically dosen't happen anymore since if there are no results,
    // it returns a single action to search for the query in the browser using a search engine
    // will leave in here just in case
    if (resultSections.length === 0)
      return <NoResults searchQuery={inputRef.current?.value || ""} />;
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
              return renderListItem(data);
            })}
          </Section>
        ))}
      </div>
    );
  };

  const renderListItem = (data: Data) => {
    switch (data.type) {
      case DataType.ACTION:
        return (
          <ActionListItem
            key={data.id}
            data={data as ActionData}
            onHover={() => setSelectedId(data.id)}
            selected={selectedId === data.id}
            onClick={closeOnClick(onActionItemClick)}
          />
        );
      case DataType.TAB:
        return (
          <TabListItem
            key={data.id}
            data={data as TabData}
            onHover={() => setSelectedId(data.id)}
            selected={selectedId === data.id}
            onClick={closeOnClick(onTabItemClick)}
          />
        );

      case DataType.BOOKMARK:
        return (
          <BookmarkListItem
            key={data.id}
            data={data as BookmarkData}
            onHover={() => setSelectedId(data.id)}
            selected={selectedId === data.id}
            onClick={closeOnClick(onBookmarkItemClick)}
          />
        );
      case DataType.HISTORY:
        return (
          <HistoryListItem
            key={data.id}
            data={data as HistoryData}
            onHover={() => setSelectedId(data.id)}
            selected={selectedId === data.id}
            onClick={closeOnClick(onHistoryItemClick)}
          />
        );
    }
  };

  const onInputChange = debounce((query: string) => {
    if (query) {
      search(query)
        .then((result) => {
          // if the the input is currently empty, dont try and and set the result/render an error
          if (!inputRef.current?.value) return;
          // console.log(result);
          if (result.hasError) {
            setError(true);
          } else if (result.data !== null) {
            // console.log(result.data);
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
        .catch(() => {
          // console.log("here is the err", err);
          // console.log("here in the catch");
          setError(true);
        });
    }
  }, 300);

  const closeOnClick = <T,>(func: (data: T) => void) => {
    return (data: T) => {
      func(data);
      props.close();
    };
  };
  return (
    <>
      <style>{styles}</style>
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
        <div className="modal-body">
          <SearchBar
            ref={inputRef}
            onKeyDown={onKeyDown}
            onChange={(query) => {
              if (!query) {
                setResultSections(null);
              } else {
                onInputChange(query);
              }
            }}
          />
          {renderBody()}
        </div>
      </FocusTrap>
    </>
  );
};
