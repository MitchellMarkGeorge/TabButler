import { useRef, useEffect, useState } from "react";

// hook to scroll to element is selected
export const useScroll = (selected: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // if the item becomes selected, scroll to it
    if (selected) {
      ref.current?.scrollIntoView({
        block: "nearest"
      });
    }
  }, [selected]);

  return ref;
};

export const useIsDarkMode = () => {
  const darkModeQuery = "(prefers-color-scheme: dark)";
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia(darkModeQuery).matches
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
