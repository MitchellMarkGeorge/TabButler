import React, { useRef, ElementRef, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface Props {
  value: string;
  setValue: (value: string) => void;
}

export default function SearchBar(props: Props) {
  const inputRef = useRef<ElementRef<"input">>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="search-bar">
        <MagnifyingGlassIcon className="search-bar-icon" />
      <input
        ref={inputRef}
        value={props.value}
        onChange={(event) => props.setValue(event.target.value)}
        className="search-bar-input text-base"
        placeholder="Search for browser tabs, actions, history, bookmarks..."
      />
    </div>
  );
}
