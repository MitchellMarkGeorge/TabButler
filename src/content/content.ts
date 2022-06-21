import React from "react";
import * as ReactDOM from "react-dom/client";
import { Message, MessagePlayload, TabData } from "../common/types";
import { Search } from "./components/Search";
import "./content.css";

const tabButlerModalRoot = document.createElement("tab-butler-modal");
const tabButlerModalBody = document.createElement("tab-butler-modal-body");
const shadow = tabButlerModalBody.attachShadow({ mode: "open" });
tabButlerModalRoot.appendChild(tabButlerModalBody);
let isOpen = false;
// is there a better way to do this??? should i just attach it in the beggining and then move on?
let reactRoot: ReactDOM.Root | null = null;

chrome.runtime.onMessage.addListener((messagePayload: MessagePlayload) => {
  // doing it like this still sends the tab data even when the component is unmoining
  // the best approach would to explicitley request the data if mounting from the background script
  if (messagePayload.message === Message.TOGGLE_SEARCH) { // should I just send the strings now istead
    if (isOpen) {
      unmountSearchComponent();
    } else {
      mountSearchComponent();
    }
  }
});

function mountSearchComponent() {
  const messagePayload = {
    message: Message.GET_TAB_DATA,
  };
  chrome.runtime.sendMessage(messagePayload, (response: TabData[]) => {
    // need to handle errors
    tabButlerModalRoot.classList.toggle("is_visible");
    reactRoot = ReactDOM.createRoot(shadow);
    const searchComponentInstance = React.createElement(Search, {
      shadowRoot: shadow,
      currentTabs: response
    });
    reactRoot.render(searchComponentInstance);
    isOpen = true;
  });
}

function unmountSearchComponent() {
  tabButlerModalRoot.classList.toggle("is_visible");
  reactRoot?.unmount();
  // clear the remaining styles in the shadow root
  while (shadow.firstChild) {
    shadow.removeChild(shadow.firstChild)
  }
  reactRoot = null;
  isOpen = false;
}

function toggleModal() {
  tabButlerModalRoot.classList.toggle("is_visible");
  if (isOpen) {
    unmountSearchComponent()
  } else {
    mountSearchComponent()
  }
  isOpen = !isOpen;
}

window.addEventListener("click", (event) => {
  // dont like this
  // event.target === tabButlerModalRoot
  if (isOpen) {
    unmountSearchComponent();
  }
});

window.addEventListener("keydown", (event) => {
  const eventKey = event.key.toLowerCase();
  if (eventKey === "escape" && isOpen) {
    // toggleModal();
    unmountSearchComponent();
  }
});

document.body.appendChild(tabButlerModalRoot);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && isOpen) {
    unmountSearchComponent()
  }
})
