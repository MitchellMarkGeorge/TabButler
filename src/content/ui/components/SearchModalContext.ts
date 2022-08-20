import { createContext, useContext } from "react";
import { Data, SearchMode } from "@common/types";

// is context enough for all of this?
// the problem with this context is that even if one variable changes, any component using the context will rerender, even it it does not use that sepecific variable
// this wont work for the sidebar
// one solution would be to just pass in the search mode as props where neccessary
// might have to have a seperate context for the rest

// the main reason this context exists is for the close() function and getting and setting the currentSearchMode
export interface SearchModalContextType {
  close: () => void;
  currentSearchMode: SearchMode;
  setCurrentSearchMode: (searchMode: SearchMode) => void;

  isLoading: boolean;
  setIsLoading: (isLoaading: boolean) => void;
  data: Data[];
  setData: (data: Data[]) => void;
  hasError: boolean;
  setHasError: (hasError: boolean) => void;
}

export const SearchModalContext = createContext<SearchModalContextType | null>(
  null,
);

export function useSearchModalContext() {
  return useContext(SearchModalContext) as SearchModalContextType;
}
