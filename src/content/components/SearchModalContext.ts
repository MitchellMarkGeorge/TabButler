import { createContext } from "react";
import { SearchMode } from "../../common/types";

export interface SearchModalContextType {
    close: () => void;
    currentSearchMode: SearchMode;
    isLoading: boolean;
    setIsLoading: (isLoaading: boolean) => void;
    setCurrentSearchMode: (searchMode: SearchMode) => void;
}

export const SearchModalContext = createContext<SearchModalContextType | null>(null)