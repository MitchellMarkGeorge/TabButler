import styled from "@emotion/styled";

export interface ListItemProps<T> {
  data: T;
  selected: boolean; // isSelected
  onClick: (data: T) => void;
  onHover: () => void;
  // style?: React.CSSProperties
}

// figure out best hover/selected colors
export const ListItem = styled.div<{ selected: boolean }>`
  width: 100%;
  
  height: 50px;
  display: flex;
  flex-direction: row;
  /* which one? */
  row-gap: 8px;
  column-gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 10px;
  /* justify-content: space-between; */
  cursor: pointer;
  /* if item is selected, the color should change (inspite of theme) */
  color: ${(props) => (props.selected ? "#fff" : "inherit")};
  background-color: ${(props) => (props.selected ? "#3182ce" : "transparent")};

  // hover css is technocally no longer needed as the element becomes selected on mouse over
  /* :hover {
    color: #f7fafc;
    background-color: #3182ce;
  } */

  .main_info_container, .button_container {
    display: flex;
    flex-direction: row;
    align-items: center;
    row-gap: 8px;
    column-gap: 8px;
  }

  .main_info_container {
    flex: 1;
    min-width: 0;
  }

  img {
    height: 24px;
    width: 24px;
  }

  .text_container {
    /*  flex might not be needed here     */
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: normal !important;
  }

  .main_text {
    font-size: 16px;
    font-weight: 590;
    /* color: #fff; */
  }

  .secondary_text {
    font-size: 10px;
    /* if selected use special color if not fall back to the default one*/
    /* color: ${(props) =>
      props.selected ? "#cbd5e0" : "rgba(255, 255, 255, 0.36)"}; */
    color: #cbd5e0;
  }

  /* :hover .secondary_text {
    color: #cbd5e0;
  } */

  .main_text,
  .secondary_text {
    flex: 1;
    /* max-width: 100%; */
    min-width: 0;
    white-space: nowrap;
    /* set width for text overflow - might use percentage */
    /* 450px */
    /* width: 475px;
    max-width: 475px; */
    overflow: hidden;
    text-overflow: ellipsis;
    /* font-size: 16px; */
    user-select: none;
  }

  .icon_button {
    cursor: pointer;
  }

  @media (prefers-color-scheme: light) {
    .secondary_text {
      color: ${(props) => (props.selected ? "#CBD5E0" : "rgba(0, 0, 0, 0.48)")};
    }

    /* :hover .secondary_text {
      color: #cbd5e0;
    } */
  }
`;
