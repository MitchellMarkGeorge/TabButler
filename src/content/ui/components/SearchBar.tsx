import React, { ElementRef, forwardRef } from "react";
import { BsSearch } from "react-icons/bs";

interface Props {
  // value: string;
  // setValue: (value: string) => void;
  onChange: (value: string) => void;
}

const SearchBar = forwardRef<ElementRef<"input">, Props>((props: Props, ref) => {

  return (
    <div className="search-bar">
      <BsSearch className="search-bar-icon" />
      <input
        ref={ref}
        onChange={(event) => props.onChange(event.target.value)}
        className="search-bar-input text-base"
        placeholder="Search for browser tabs, actions, history, bookmarks..."
      />
    </div>
  );
});

export default SearchBar;