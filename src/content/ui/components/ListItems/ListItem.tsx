import React from "react";
import { createComponent } from "../utils";

export interface ListItemProps<T> {
  data: T;
  selected: boolean; // isSelected
  onClick: (data: T) => void;
  onHover: () => void;
}

const ListItemContainer = createComponent();
export const MainInfoContainer = createComponent({
  className: "main-info-container",
});
export const ButtonContainer = createComponent({
  className: "button-container",
});
export const TextContainer = createComponent({ className: "text-container" });

export const MainText = createComponent({ className: "main-text" });
export const SecondaryText = createComponent({ className: "secondary-text" });
export const IconButton = createComponent({ className: "icon-button" });

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  selected: boolean;
}

export const ListItem = ({ selected, children, ...rest }: Props) => {
  return (
    <ListItemContainer
      className={selected ? "list-item-selected" : "list-item"}
      {...rest}
    >
      {children}
    </ListItemContainer>
  );
};
