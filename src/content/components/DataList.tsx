import styled from "@emotion/styled";

export const DataList = styled.div`
  height: 100%;
  max-height: 100%;
  overflow: auto;
  width: 100%;
  flex: auto;
  color: #f7fafc;

  ::-webkit-scrollbar {
    display: none;
  }

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.8);
  }
`;
