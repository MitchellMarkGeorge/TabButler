export interface ListItemProps<T> {
  data: T;
  selected: boolean; // isSelected
  // onClick: (data: T) => void;
  onHover: () => void;
}

