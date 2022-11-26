import { WebSearchEngines } from "@common/types";
import React, { useState } from "react";
import {
  ListItem,
  ListItemProps,
  MainText,
  MainInfoContainer,
  SecondaryText,
  TextContainer,
} from "./ListItem";
import { HiGlobe } from "@react-icons/all-files/hi/HiGlobe";
import { useIsDarkMode } from "../../hooks";

export const WebSearchEngineListItem = ({
  data,
  onClick,
  onHover,
  selected,
}: ListItemProps<WebSearchEngines>) => {
  // const ref = useScroll(selected);
  // is it fine to be used like this???
  const [hasImageError, setHasImageError] = useState(false);
  const isDarkMode = useIsDarkMode();

  const getIcon = () => {
    if (hasImageError) {
      return (
        <HiGlobe
          size="24px"
          color={
            isDarkMode ? "rgba(255, 255, 255, 0.36)" : "rgba(0, 0, 0, 0.36)"
          }
        />
      );
    } else {
      return (
        <img
          src={data.icon}
          onError={() => setHasImageError(true)}
          height="24px"
          width="24px"
        />
      );
    }
  };
  return (
    <ListItem
      onClick={() => onClick(data)}
      selected={selected}
      onMouseOver={onHover}
    >
      <MainInfoContainer>
        {getIcon()}
        <TextContainer>
          <MainText>{`Search with ${data.name}`}</MainText>
          <SecondaryText>{data.url}</SecondaryText>
        </TextContainer>
      </MainInfoContainer>
    </ListItem>
  );
};
