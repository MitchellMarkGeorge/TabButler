import { useContext, useEffect, useRef, useState } from "react";
import { Data, SearchMode } from "../../common/types";
import { getActions } from "./services/actions";
import { getTabData } from "./services/tabs";

import {
  SearchModalContext,
  SearchModalContextType,
} from "./components/SearchModalContext";

// hook to scroll to element is selected
export const useScroll = (selected: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // if the item becomes selected, scroll to it
    if (selected) {
      ref.current?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selected]);

  return ref;
};

export const useIsDarkMode = () => {
  const darkModeQuery = "(prefers-color-scheme: dark)";
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia(darkModeQuery).matches,
  );

  const onChange = (event: MediaQueryListEvent) => {
    setIsDarkMode(event.matches);
  };
  useEffect(() => {
    window.matchMedia(darkModeQuery).addEventListener("change", onChange);

    return () => {
      window.matchMedia(darkModeQuery).removeEventListener("change", onChange);
    };
  }, []);

  return isDarkMode;
};

export const useData = (searchMode: SearchMode) => {
  // use searchmode from context
  // the only way for the local state and the context to be updated was for everything to be in context
  // might just transfer over to something like zustand
  const { isLoading, setIsLoading, data, setData, hasError, setHasError } =
    useContext(SearchModalContext) as SearchModalContextType;
  const fetchData = () => {
    let getDataFunc: () => Promise<Data[]>;
    if (searchMode === SearchMode.TAB_ACTIONS) {
      getDataFunc = getActions;
    } else {
      getDataFunc = getTabData;
    }

    // might no linger be needed
    // if (!isLoading) {
    //   console.log("setting loading to true");
    //   setIsLoading(true);
    // }
    getDataFunc()
      .then((data) => {
        setData(data);
        setIsLoading(false); // for some reason this value is not updating
        // these updates need to be batched together
      })
      .catch(() => {
        setIsLoading(false);
        setHasError(true);
      });
  };

  useEffect(() => {
    fetchData();
  }, [searchMode]);

  return { hasError, data, updateData: setData, fetchData, isLoading };
};
