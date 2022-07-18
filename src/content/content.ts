import browser from "webextension-polyfill";
import {
  getSearchModeFromMessage,
  Message,
  MessagePlayload,
  SearchMode,
} from "../common/types";
import "./content.css";
import { SearchUIHandler } from "./SearchUIHandler";

const tabButlerModalRoot = document.createElement("tab-butler-modal");
// needs to be open so that the click event can buble up
const shadow = tabButlerModalRoot.attachShadow({ mode: "open" });
let isOpen = false; // technically no longer needed
let currentSearchMode: SearchMode;
const searchUiHandler = new SearchUIHandler();
// make this file into a class that will be easier to manage?
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

function mountSearchComponent(message: Message) {
  const requestedSearchMode = getSearchModeFromMessage(message);
  document.addEventListener("click", unmountOnClick);
  searchUiHandler.mount(shadow, {
    shadowRoot: shadow,
    searchMode: requestedSearchMode,
    close: unmountSearchComponent,
  });
  tabButlerModalRoot.classList.toggle("tab_butler_modal_visible");
  currentSearchMode = requestedSearchMode;
  isOpen = true;
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
  // doing this first here so it disapears as soon as possible
  tabButlerModalRoot.classList.toggle("tab_butler_modal_visible");
  document.removeEventListener("click", unmountOnClick);
  searchUiHandler.unMount();
  // clear the remaining styles in the shadow root
  while (shadow.firstChild) {
    shadow.removeChild(shadow.firstChild);
  }
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

document.body.appendChild(tabButlerModalRoot); // is there a possibility that document.body is null?