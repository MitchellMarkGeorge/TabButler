import browser from "webextension-polyfill";
import {
  getSearchModeFromMessage,
  Message,
  MessagePlayload,
  SearchMode,
} from "../common/types";
import "./content.css";
import { SearchUIHandler } from "./SearchUIHandler";

// if there is already a modal element in the dom (meaning there was an update), remove the existing one and create a new one
// this should unmount the react component and remove the shadow dom. for now this leaves some listeners attached but it should not affect any functionality
const existingTabButlerModalRoot = document.querySelector("tab-butler-modal");
if (existingTabButlerModalRoot) {
  existingTabButlerModalRoot.remove();
}

// by only creating and appending the element, dynamically when it is requested, it should save on memory and reduce some parts of the code
// like the visibility toggeling and the style tag removal in the root
// this should also help in sites where the dom might change from time to time, invalidating
let tabButlerModalRoot: HTMLElement | null = null;
// needs to be open so that the click event can bubble up
let shadow: ShadowRoot | null = null;
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
        console.log("here")
        mountSearchComponent(message);
      }
      break;
    case Message.CHECK_SEARCH_OPEN:
      return Promise.resolve({ isOpen, currentSearchMode });
  }
};
browser.runtime.onMessage.addListener(messageListener);

function mountSearchComponent(message: Message) {
  tabButlerModalRoot = document.createElement("tab-butler-modal");
// needs to be open so that the click event can bubble up
  shadow = tabButlerModalRoot.attachShadow({ mode: "open" });
  const requestedSearchMode = getSearchModeFromMessage(message);
  document.addEventListener("click", unmountOnClick);
  searchUiHandler.mount(shadow, {
    shadowRoot: shadow,
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

window.addEventListener("beforeunload", () => {
  if (isOpen) {
    unmountSearchComponent();
  }
});