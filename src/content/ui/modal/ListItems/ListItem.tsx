import React from "react";

export interface ListItemProps<T> {
  data: T;
  selected: boolean; // isSelected
  onClick: (data: T) => void;
  onHover: () => void;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  selected: boolean;
}
export const ListItem = ({ selected, children, ...rest }: Props) => {
  return (
    <div
      className={
        selected ? "tab-butler-list-item-selected" : "tab-butler-list-item"
      }
      {...rest}
    >
      {children}
    </div>
  );
};
