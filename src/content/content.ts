import React from "react";
import * as ReactDOM from "react-dom/client"
import { MESSAGES } from "../common/common";
import { MessagePlayload, TabData } from "../common/types";
import { Search } from "./components/Search";
import "./content.css"

const tabButlerModalRoot = document.createElement("tab-butler-modal");
const tabButlerModalBody = document.createElement("tab-butler-modal-body");
// const shadow = tabButlerModalBody.attachShadow({ mode: 'open'})
tabButlerModalRoot.appendChild(tabButlerModalBody);
let isOpen = false;
// is there a better way to do this??? should i just attach it in the beggining and then move on?
let reactRoot: ReactDOM.Root | null = null;


chrome.runtime.onMessage.addListener((messagePayload: MessagePlayload) => {
  // doing it like this still sends the tab data even when the component is unmoining
  // the best approach would to explicitley request the data if mounting from the background script
  if (messagePayload.message === MESSAGES.TOGGLE_SEARCH) {
    console.log(messagePayload.data)
    if (isOpen) {
      unmountSearchComponent();
    } else {
      mountSearchCompoenent(messagePayload.data);
    }
  }
})

function mountSearchCompoenent(data: TabData[]) {
  tabButlerModalRoot.classList.toggle("is_visible")
    reactRoot = ReactDOM.createRoot(tabButlerModalBody)
    const searchComponentInstance = React.createElement(Search);
    reactRoot.render(searchComponentInstance)
    isOpen = true;
}

function unmountSearchComponent() {
  tabButlerModalRoot.classList.toggle("is_visible")
  reactRoot?.unmount();
  reactRoot = null;
  isOpen = false;
}

function toggleModal() {
  tabButlerModalRoot.classList.toggle("is_visible")
  if (isOpen) {
    reactRoot?.unmount() // should not be null here
    reactRoot = null;
  } else {
    reactRoot = ReactDOM.createRoot(tabButlerModalBody)
    const searchComponentInstance = React.createElement(Search);
    reactRoot.render(searchComponentInstance)
  }
  isOpen = !isOpen;
}

window.addEventListener("click", (event) => {
  // dont like this 
  console.log(event.target)
  if (event.target === tabButlerModalRoot) {
    // toggleModal();
    unmountSearchComponent()
  }
})

window.addEventListener("keydown", event => {
  const eventKey = event.key.toLowerCase()
  if (eventKey === "escape" && isOpen) {
    // toggleModal();
    unmountSearchComponent()
  }
})

document.body.appendChild(tabButlerModalRoot);


// chrome.tabs.query({ currentWindow: true, status: "loading", }, result => {
//   console.log(result)
// })
