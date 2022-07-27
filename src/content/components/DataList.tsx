import styled from "@emotion/styled";

// rename this to List/ ListContainer
export const DataList = styled.div`
  height: 100%;
  /* is this needed? */
  max-height: 100%;
  overflow: auto;
  width: 100%;
  flex: auto;
  /* should I declare color here? */
  color: #fff;

  /* remove the scroll bar */
  /* chromeium */
  ::-webkit-scrollbar {
    display: none;
  }
  /* firefox */
  scrollbar-width: none;

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.8);
  }
`;
