import styled from "@emotion/styled";

export const Kbd = styled.kbd`
  /* background-color: #eee; */
  background-color: transparent;
  border-radius: 3px;
  border: 1px solid #b4b4b4;
  /* border-color: #b4b4b4; */
  /* border-style: solid; */
  /* border-width: 1px 1px 2px; */
  /* box-shadow: 0 1.5px 0 0 rgba(255, 255, 255, 0.7),
    0 1px 1px rgba(0, 0, 0, 0.2) inset; */
  /* color: #333; */
  display: inline-block;
  /* font-size: 8px; */
  /* font-weight: 700; */
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
  margin-right: 4px;

  @media (prefers-color-scheme: light) {
    color: #333;
    background-color: #eee;
  }
`;
