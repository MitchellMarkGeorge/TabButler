import browser from "webextension-polyfill";
import {
  getSearchModeFromMessage,
  Message,
  MessagePlayload,
  SearchMode,
} from "../common/types";
// import "./content.css";
import { SearchUIHandler } from "./SearchUIHandler";
// import type * as CSS from 'csstype';

// if there is already a modal element in the dom (meaning there was an update), remove the existing one and create a new one
// this should unmount the react component and remove the shadow dom. for now this leaves some listeners attached but it should not affect any functionality
const existingTabButlerModalRoot = document.querySelector("tab-butler-modal");
if (existingTabButlerModalRoot) {
  existingTabButlerModalRoot.remove();
}

const shutDownEvent = "tab-butler-shutdown";
// send a shutdown message to any other content script in this tab, disabling them permernently
document.dispatchEvent(new CustomEvent(shutDownEvent));
// add a listener for the same shutdown event
document.addEventListener(shutDownEvent, shutdownScript);
// by only creating and appending the element dynamically when it is requested, it should save on memory and reduce some parts of the code
// like the visibility toggeling and the style tag removal in the root
// this should also help in sites where the dom might change from time to time, invalidating
let tabButlerModalRoot: HTMLElement | null = null;
// needs to be open so that the click event can bubble up
let isOpen = false; // technically no longer needed
let currentSearchMode: SearchMode;
const searchUiHandler = new SearchUIHandler();

const messageListener = (messagePayload: MessagePlayload) => {
  // i will need to rename the component from search to something else
  const { message } = messagePayload;
  switch (message) {
    case Message.TOGGLE_TAB_ACTIONS:
    case Message.TOGGLE_TAB_SEARCH:
      if (isOpen) {
        // special function to switch modes if the message is different
        unmountSearchComponentFromMessage(message);
      } else {
        mountSearchComponent(message);
      }
      break;
    case Message.CHECK_SEARCH_OPEN:
      return Promise.resolve({ isOpen, currentSearchMode });
  }
};
browser.runtime.onMessage.addListener(messageListener);

const styleModalRoot = (modalRoot: HTMLElement) => {
  modalRoot.style.position = "fixed";
  modalRoot.style.left = "0";
  modalRoot.style.right = "0";
  modalRoot.style.bottom = "0";
  modalRoot.style.top = "0";
  modalRoot.style.display = "flex";
  modalRoot.style.justifyContent = "center";
  modalRoot.style.boxSizing = "border-box";
  modalRoot.style.paddingTop = "20vh";
  modalRoot.style.width = "100%";
  modalRoot.style.height = "100%";
  modalRoot.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modalRoot.style.zIndex = "999999";
};

function mountSearchComponent(message: Message) {
  // create a new modal root on mount and append as the last child of the body
  tabButlerModalRoot = document.createElement("tab-butler-modal");
  styleModalRoot(tabButlerModalRoot);
  // needs to be open so that the click event can bubble up
  tabButlerModalRoot.attachShadow({ mode: "open" });
  const requestedSearchMode = getSearchModeFromMessage(message);
  document.addEventListener("click", unmountOnClick);
  searchUiHandler.mount(tabButlerModalRoot.shadowRoot as ShadowRoot, {
    searchMode: requestedSearchMode,
    close: unmountSearchComponent,
  });
  currentSearchMode = requestedSearchMode;
  isOpen = true;
  document.body.appendChild(tabButlerModalRoot);
}

function unmountSearchComponentFromMessage(message: Message) {
  // get the accosiated search type of the message
  const requestedSearchMode = getSearchModeFromMessage(message);
  if (currentSearchMode === requestedSearchMode) {
    // if the search type of the currently open search compenent is the same
    // as the the received one, the user issued the same command
    // meaning they just want to toggle it off
    unmountSearchComponent();
  } else {
    // in this case, the user wants to switch to a different search mode
    // update the props of the component with the nessecary information
    // and update the current search mode
    searchUiHandler.updateProps({
      searchMode: requestedSearchMode,
    });
    currentSearchMode = requestedSearchMode;
  }
}

function unmountSearchComponent() {
  document.removeEventListener("click", unmountOnClick);
  searchUiHandler.unMount();
  tabButlerModalRoot?.remove();
  tabButlerModalRoot = null;
  isOpen = false;
  // should i reset currentSearchMode?
}

const unmountOnClick = (event: MouseEvent) => {
  // see if there is a better way to do this
  // this details the path that the document click event bubbled up from
  const [firstElementTarget] = (event as PointerEvent).composedPath();
  // if the user clicked on the overlay
  if (firstElementTarget === tabButlerModalRoot) {
    unmountSearchComponent();
  }
};

function shutdownScript() {
  console.log("shutting down");
  unmountSearchComponent();
  // remove the listener to so it can't be triggered again
  // this prevents any old content scripts in the tab from being triggered in the tab
  browser.runtime.onMessage.removeListener(messageListener);
}

window.addEventListener("beforeunload", () => {
  if (isOpen) {
    unmountSearchComponent();
  }
});
