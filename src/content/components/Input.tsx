import styled from "@emotion/styled";

export const Input = styled.input`
  width: 100%;
  background-color: transparent;
  height: 50px;
  border: none;
  /* border: 1px solid rgba(255, 255, 255, 0.36); */
  /* border-radius: 10px; */
  color: #f7fafc;
  /* padding-inline: 16px; */
  /* font-size: 16px; */
  font-size: 24px;
  font-weight: 450;
  /* flex: none; */

  ::placeholder {
    color: rgba(255, 255, 255, 0.36);
  }

  :focus {
    outline: none;
  }

  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.8);
    ::placeholder {
      color: rgba(0, 0, 0, 0.36);
    }
  }
`;
