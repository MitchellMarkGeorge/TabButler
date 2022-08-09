import { useRef, useEffect, useState, useContext } from "react";
import { Data, SearchMode } from "../../common/types";
import { getActions } from "../actions";
import { getCurrentTabData } from "../utils";
import {
  SearchModalContext,
  SearchModalContextType,
} from "./SearchModalContext";

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
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<Data[]>([]);
  const { isLoading, setIsLoading } = useContext( SearchModalContext,) as SearchModalContextType;
  const fetchData = () => {
    let getDataFunc: () => Promise<Data[]>;
    if (searchMode === SearchMode.TAB_ACTIONS) {
      getDataFunc = getActions;
    } else {
      getDataFunc = getCurrentTabData;
    }

    if (!isLoading) {
      console.log("setting loading to true");
      setIsLoading(true);
    }
    getDataFunc()
      .then((data) => {
        setIsLoading(false);
        setData(data);
      })
      .catch(() => {
        setIsLoading(false);
        setHasError(true);
      });
  };

  useEffect(() => {
    fetchData();
  }, [searchMode]);

  return { hasError, data, updateData: setData, fetchData };
};
