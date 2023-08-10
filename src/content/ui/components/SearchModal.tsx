// import createCache from "@emotion/cache";
// import { CacheProvider, css, Global } from "@emotion/react";
import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/styles.scss?inline";
import SearchBar from "./SearchBar";
// import NoResults from "./NoResults";
import Section from "./Section";
import { ActionData, DataType, SectionType, TabData } from "@common/types";
import {
  FolderPlusIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ActionListItem } from "./ListItems/ActionListItem";
import { BottomBar } from "./BottomBar";
import { TabListItem } from "./ListItems/TabListItem";
import { nanoid } from "nanoid";
// import { action } from "webextension-polyfill";
// import Error from "./Error";

export interface Props {
  close: () => void;
}
const actions: ActionData[] = [
  {
    name: "New Tab",
    icon: PlusIcon,
    type: DataType.ACTION,
    id: nanoid(),
  },
  {
    name: "New Window",
    icon: FolderPlusIcon,
    type: DataType.ACTION,
    id: nanoid(),
  },
  {
    name: "Close tab",
    icon: XMarkIcon,
    type: DataType.ACTION,
    id: nanoid(),
  },
];

const tabs: TabData[] = [
  {
    favIcon: null,
    type: DataType.TAB,
    tabId: 909,
    title: "Test",
    url: "https://test.com",
    windowId: 0,
    id: nanoid(),
  },

  {
    favIcon: null,
    type: DataType.TAB,
    tabId: 909,
    title: "Test",
    url: "https://test.com",
    windowId: 0,
    id: nanoid(),
  },

  {
    favIcon: null,
    type: DataType.TAB,
    tabId: 909,
    title: "Test",
    url: "https://test.com",
    windowId: 0,
    id: nanoid(),
  },
];

const results: SectionType[] = [
  {
    name: "Tabs",
    items: tabs,
    matchScore: 0.9,
  },

  {
    name: "Actions",
    items: actions,
    matchScore: 0.72,
  },
];

// alternative to the style tag is a link tag with the chrome url to transpiled style sheet
// i could also use jss https://cssinjs.org/setup?v=v10.9.2

export const SearchModal = (props: Props) => {
  // focus trap
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SectionType[]>(results); // sorted array of sections
  // think about this - perfomance implecations and general readability
  // this should return a sorted list of all the id of the items (sorted by score)
  const sortedIdList = useMemo(
    () =>
      searchResults
        .map((section) => section.items.map((item) => item.id))
        .flat(),
    [searchResults],
  );
  // console.log(sortedIdList);
  const [selectedId, setSelectedId] = useState<string>(sortedIdList[0]);


  const buildItemIdMap = () => {
    const  items = searchResults.map((section) => section.items).flat();
    console.log(items);
    const itemIdMap = new Map();
    items.forEach(item => {
      itemIdMap.set(item.id, item);
    });
    return itemIdMap;
  };

  const itemIdMap = useMemo(buildItemIdMap, [searchResults]);

  const onKeyDown = (event: KeyboardEvent) => {
    // circular navigation might confuse users
    let nextIndex = 0;
    const selectedListIdIndex = sortedIdList.indexOf(selectedId);
    if (selectedListIdIndex === -1) return;
    // using tab caused some issues
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (selectedListIdIndex !== 0) {
        nextIndex = selectedListIdIndex - 1;
        setSelectedId(sortedIdList[nextIndex]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (selectedListIdIndex !== sortedIdList.length - 1) {
        nextIndex = selectedListIdIndex + 1;
        setSelectedId(sortedIdList[nextIndex]);
      }
    }
    else if (event.key === "Enter") {
      event.preventDefault();
      console.log(itemIdMap.get(selectedId))
      // onSubmit();
    }
  };

  const unmountOnEscape = (event: KeyboardEvent) => {
    // this is neccessary to stop some sites from preventing some key strokes from being registered
    event.stopPropagation();
    if (event.key === "Escape") {
      props.close();
    }
  };

  const addListeners = () => {
    document.addEventListener("keydown", unmountOnEscape, true);
    // should this be keydown? with behaviour as smooth, navigation is a bit less performant and the selection can go out of view
    document.addEventListener("keydown", onKeyDown, true);
  };

  const removeListeners = () => {
    document.removeEventListener("keydown", unmountOnEscape, true);
    document.removeEventListener("keydown", onKeyDown, true);
  };

  useEffect(() => {
    addListeners();
    return removeListeners;
  });

  const renderSections = (sections: SectionType[]) => {
    return sections.map((section) => (
      <Section name={section.name} key={section.name}>
        {section.items.map((item) => {
          if (item.type === DataType.ACTION) {
            return (
              <ActionListItem
                key={item.id}
                data={item as ActionData}
                onHover={() => setSelectedId(item.id)}
                selected={selectedId === item.id}
              />
            );
          } else if (item.type === DataType.TAB) {
            return (
              <TabListItem
                key={item.id}
                data={item as TabData}
                onHover={() => setSelectedId(item.id)}
                selected={selectedId === item.id}
              />
            );
          }
        })}
      </Section>
    ));
  };
  return (
    <>
      <style>{styles}</style>
      <div className="modal-body">
        <SearchBar value={searchQuery} setValue={setSearchQuery} />
        <div className="section-list">
          {/* <Section name="Tabs">
            {tabs.map((tab, i) => (
              <TabListItem
                key={i}
                data={tab}
                onHover={() => setSelectedIndex(i)}
                selected={selectedIndex === i}
              />
            ))}
          </Section>
          <Section name="Tabs">
            {tabs.map((tab, i) => (
              <TabListItem
                key={i}
                data={tab}
                onHover={() => setSelectedIndex(i)}
                selected={selectedIndex === i}
              />
            ))}
          </Section>
          <Section name="Actions">
            {actions.map((action, i) => (
              <ActionListItem
                key={i}
                data={action}
                onHover={() => setSelectedIndex(i)}
                selected={selectedIndex === i}
              />
            ))}
          </Section> */}
          {renderSections(searchResults)}
        </div>
        <BottomBar />
        {/* <NoResults searchQuery={searchQuery}/> */}
        {/* <Error/> */}
      </div>
    </>
  );
};
