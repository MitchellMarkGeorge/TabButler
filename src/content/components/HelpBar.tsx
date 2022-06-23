import styled from "@emotion/styled";
import React from "react";
import { Kbd } from "./Kbd";

const HelpBarContainer = styled.div`
  height: 20px;
  width: 100%;
  /* flex: none; */
  /* padding: 8px; */
  padding-left: 8px;
  padding-right: 8px;
  font-size: 10px;
  display: flex;
  align-items: center;
  flex-direction: row;
  column-gap: 8px;
  color: rgba(255, 255, 255, 0.36);


  @media (prefers-color-scheme: light) {
    color: rgba(0, 0, 0, 0.48);
    /* color: #333; */
  }
`;

interface Props {
  isTabActionsMode: boolean;
}
export default function HelpBar({ isTabActionsMode }: Props) {
  return (
    <HelpBarContainer>
      <div>
        <Kbd>&uarr;</Kbd>
        Up
      </div>

      <div>
        <Kbd>&darr;</Kbd>
        Down
      </div>

      <div>
        <Kbd>Enter</Kbd>
        {isTabActionsMode ? "Execute action" : "Go to tab"}
      </div>

      <div>
        <Kbd>Esc</Kbd>
        Close
      </div>
    </HelpBarContainer>
  );
}
