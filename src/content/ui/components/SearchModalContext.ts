import { createContext } from "react";
import { Data, SearchMode } from "@common/types";

export interface SearchModalContextType {
  close: () => void;
  currentSearchMode: SearchMode;
  isLoading: boolean;
  setIsLoading: (isLoaading: boolean) => void;
  data: Data[];
  setData: (data: Data[]) => void;
  hasError: boolean;
  setHasError: (hasError: boolean) => void;
  setCurrentSearchMode: (searchMode: SearchMode) => void;
}

export const SearchModalContext = createContext<SearchModalContextType | null>(
  null,
);
