import styled from "@emotion/styled";

export const ModalBody = styled.div`
  box-sizing: border-box !important;
  position: relative !important;
  width: 650px !important;
  /* was cna use viewport units to make is scale to different screeens */
  height: 500px !important;
  max-height: 500px !important;
  background-color: rgb(46, 49, 56);
  padding: 16px;
  border-radius: 8px;
  overflow: none;
  z-index: 9999999 !important;
  /* figure out the best box shadow */
  /* box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); */
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;

  @media (prefers-color-scheme: light) {
    background-color: #fff;
  }
`;
