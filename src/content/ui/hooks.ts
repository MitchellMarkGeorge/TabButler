import { useEffect, useRef, useState } from "react";
// import { Data, SearchMode } from "../../common/types";
// import { getTabData } from "./services/tabs";

// import { useSearchModalContext } from "./components/SearchModalContext";
// import { getHistoryData } from "./services/history";

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
  const mediaQuery = window.matchMedia(darkModeQuery);
  const [isDarkMode, setIsDarkMode] = useState(
    mediaQuery.matches,
  );

  const onChange = (event: MediaQueryListEvent) => {
    setIsDarkMode(event.matches);
  };
  useEffect(() => {
    mediaQuery.addEventListener("change", onChange);

    return () => {
     mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  return isDarkMode;
};

// export const useData = (searchMode: SearchMode) => {
//   // use searchmode from context
//   // the only way for the local state and the context to be updated was for everything to be in context
//   // might just transfer over to something like zustand
//   const { isLoading, setIsLoading, data, setData, hasError, setHasError } =
//     useSearchModalContext();
//   const fetchData = () => {
//     let getDataFunc: () => Promise<Data[]>;
//     // i should renamne these functions to "fetch"
//     if (searchMode === SearchMode.TAB_ACTIONS) {
//       getDataFunc = getActions;
//     } else if (searchMode === SearchMode.TAB_HISTORY) {
//       getDataFunc = getHistoryData;
//     } else {
//       getDataFunc = getTabData;
//     }

//     // if (!isLoading) {
//     //   console.log("setting loading to true");
//     //   setIsLoading(true);
//     // }
//     getDataFunc()
//       .then((data) => {
//         setData(data);
//         setIsLoading(false); // for some reason this value is not updating
//         // these updates need to be batched together
//       })
//       .catch(() => {
//         setIsLoading(false);
//         setHasError(true);
//       });
//   };

//   useEffect(() => {
//     fetchData();
//   }, [searchMode]);

//   return { hasError, data, updateData: setData, fetchData, isLoading };
// };
