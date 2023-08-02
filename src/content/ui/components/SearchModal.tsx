// import createCache from "@emotion/cache";
// import { CacheProvider, css, Global } from "@emotion/react";
import React, { useState } from "react";
import styles from "../styles/styles.scss?inline";
import SearchBar from "./SearchBar";
// import NoResults from "./NoResults";
import Section from "./Section";
import { ActionData } from "@common/types";
import {
  FolderPlusIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ActionListItem } from "./ListItems/ActionListItem";
// import Error from "./Error";

export interface Props {
  close: () => void;
}

// alternative to the style tag is a link tag with the chrome url to transpiled style sheet
// i could also use jss https://cssinjs.org/setup?v=v10.9.2

export const SearchModal = () => {
  // focus trap
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const actions: ActionData[] = [
    {
      name: "New Tab",
      icon: PlusIcon,
    },
    {
      name: "New Window",
      icon: FolderPlusIcon,
    },
    {
      name: "Close tab",
      icon: XMarkIcon,
    },
  ];
  return (
    <>
      <style>{styles}</style>
      <div className="modal-body">
        <SearchBar value={searchQuery} setValue={setSearchQuery} />
        <Section name="Test">
          {actions.map((action, i) => (
            <ActionListItem
              key={i}
              data={action}
              onHover={() => setSelectedIndex(i)}
              selected={selectedIndex === i}
            />
          ))}
        </Section>
        {/* <NoResults searchQuery={searchQuery}/> */}
        {/* <Error/> */}
      </div>
    </>
  );
};
