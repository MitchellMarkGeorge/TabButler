import styled from "@emotion/styled";

export const Kbd = styled.kbd`
  /* background-color: #eee; */
  background-color: transparent;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  display: inline-block;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
  margin-right: 4px;

  @media (prefers-color-scheme: light) {
    color: #333;
    background-color: #eee;
    border: none;
  }
`;
