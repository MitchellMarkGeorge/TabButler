// import createCache from "@emotion/cache";
// import { CacheProvider, css, Global } from "@emotion/react";
import React, { useEffect, useMemo, useState } from "react";
import { Data, SearchMode } from "@common/types";
import { SearchModalContext } from "./SearchModalContext";
import { SearchViewContainer } from "./SearchViewContainer";
import { ModalBody } from "./utils";
import styles from "../styles/styles.scss";
// import { SideBar } from "./SideBar";
// will release tab filters first

export interface Props {
  searchMode: SearchMode;
  close: () => void; // function to completely unmount the modal
}

// alternative to the style tag is a link tag with the chrome url to transpiled style sheet
// i could also use jss https://cssinjs.org/setup?v=v10.9.2

export const SearchModal = (props: Props) => {
  const [currentSearchMode, setCurrentSearchMode] = useState<SearchMode>(
    props.searchMode,
  ); // make the inital value the searchMode that was passed in
  // puting the loading state here so it can be put in the context
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    // console.log("props.searchMode updated");
    // only update the currentSearchmode if the incomming searchMode from the props is not the same as the current one
    // on mount, the value of currentSearch mode is set from the props so it should not be set again
    if (currentSearchMode !== props.searchMode) {
      // console.log("setting currentSearchMode with props.searchMode");
      // it is important to set loading to true here so that when the component rerenders after the currentSearchMode has changed, it renders the loading state, not the old data with incorrect components
      // updates are batched together
      // make a function that ties these 2 functions together
      // the modal only works if these updates can be batched together so when the current search mode changes, it is already in a loading state so the incorrect data is not rendered
      setIsLoading(true);
      console.log("setting loading to true...");
      // loading is true as new data based on the new currentSearch mode is fetched
      setCurrentSearchMode(props.searchMode);
    }
  }, [props.searchMode]);

  // is this nessecary?
  const contextValue = useMemo(
    () => ({
      close: props.close,
      currentSearchMode,
      setCurrentSearchMode,
      setIsLoading,
      isLoading,
      setHasError,
      hasError,
      data,
      setData,
    }),
    [props, currentSearchMode, isLoading, hasError, data],
  ); // think about this - should i just use the object as is?

  return (
    <SearchModalContext.Provider value={contextValue}>
      <style>{styles}</style>
      <ModalBody>
        {/* <SideBar /> */}
        <SearchViewContainer />
      </ModalBody>
    </SearchModalContext.Provider>
  );
};
