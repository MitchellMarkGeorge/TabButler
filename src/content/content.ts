import React from "react";
import * as ReactDOM from "react-dom/client";
import {
  getSearchType,
  Message,
  MessagePlayload,
  SearchType,
  TabData,
} from "../common/types";
import { getActions } from "./actions";
import { Search } from "./components/Search";
import "./content.css";

const tabButlerModalRoot = document.createElement("tab-butler-modal");
const tabButlerModalBody = document.createElement("tab-butler-modal-body");
const shadow = tabButlerModalBody.attachShadow({ mode: "open" });
tabButlerModalRoot.appendChild(tabButlerModalBody);
let isOpen = false;
// is there a better way to do this??? should i just attach it in the beggining and then move on?
let reactRoot: ReactDOM.Root | null = null;

chrome.runtime.onMessage.addListener(({ message }: MessagePlayload) => {
  // i will need to rename the component from search to something else
  if (
    message === Message.TOGGLE_TAB_ACTIONS ||
    message === Message.TOGGLE_TAB_SEARCH
  ) {
    const searchType = getSearchType(message);
    if (isOpen) {
      unmountSearchComponent();
    } else {
      mountSearchComponent(searchType);
    }
  }
});

function mountSearchComponent(searchType: SearchType) {
  if (searchType === SearchType.TAB_ACTIONS) {
    // render it normally with actions as the received data
    tabButlerModalRoot.classList.toggle("is_visible");
    reactRoot = ReactDOM.createRoot(shadow);
    const searchComponentInstance = React.createElement(Search, {
      shadowRoot: shadow,
      searchType,
      actions: getActions(),
    });
    reactRoot.render(searchComponentInstance);
    isOpen = true;

  } else {
    // default to search
    const messagePayload = {
      message: Message.GET_TAB_DATA,
    };
    chrome.runtime.sendMessage(messagePayload, (response: TabData[]) => {
      // going to leave this in here as we need to wait for the responce before making the modal root visible
      // all the needed data should be present before anything is mounted
      tabButlerModalRoot.classList.toggle("is_visible");
      reactRoot = ReactDOM.createRoot(shadow);
      const searchComponentInstance = React.createElement(Search, {
        shadowRoot: shadow,
        searchType,
        currentTabs: response,
      });
      reactRoot.render(searchComponentInstance);
      isOpen = true;
    });
  }
}

function unmountSearchComponent() {
  tabButlerModalRoot.classList.toggle("is_visible");
  reactRoot?.unmount();
  // clear the remaining styles in the shadow root
  while (shadow.firstChild) {
    shadow.removeChild(shadow.firstChild);
  }
  reactRoot = null;
  isOpen = false;
}

// remove these listeners on page exit
// window.addEventListener("click", () => {
//   if (isOpen) {
//     unmountSearchComponent();
//   }
// });

// remove these listeners on page exit
window.addEventListener("keydown", (event) => {
  const eventKey = event.key.toLowerCase();
  if (eventKey === "escape" && isOpen) {
    // toggleModal();
    unmountSearchComponent();
  }
});

// remove these listeners on page exit
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && isOpen) {
    unmountSearchComponent();
  }
});

document.body.appendChild(tabButlerModalRoot);
