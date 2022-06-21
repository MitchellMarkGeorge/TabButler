import { useRef, useEffect } from "react";

export const useScroll = (selected: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // if the item becomes selected, scroll to it
    if (selected) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selected]);

  return ref;
};
