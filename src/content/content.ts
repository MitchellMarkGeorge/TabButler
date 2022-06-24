import React from "react";
import * as ReactDOM from "react-dom/client";
import {
  getSearchMode,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
  UpdatedTabDataMessagePayload,
} from "../common/types";
import { getActions } from "./actions";
import { Search } from "./components/Search";
import "./content.css";

const tabButlerModalRoot = document.createElement("tab-butler-modal");
const tabButlerModalBody = document.createElement("tab-butler-modal-body");
const shadow = tabButlerModalBody.attachShadow({ mode: "open" });
tabButlerModalRoot.appendChild(tabButlerModalBody);
let isOpen = false;
let currentSearchMode: SearchMode;
// is there a better way to do this??? should i just attach it in the beggining and then move on?
let reactRoot: ReactDOM.Root | null = null;

chrome.runtime.onMessage.addListener((messagePayload: MessagePlayload, sender, sendResponse) => {
  // i will need to rename the component from search to something else
  const { message } = messagePayload;
  if (
    message === Message.TOGGLE_TAB_ACTIONS ||
    message === Message.TOGGLE_TAB_SEARCH
  ) {
    if (isOpen) {
      // unmountSearchComponent();
      // special function to switch modes if the message is different
      unmountSearchComponentFromMessage(message);
    } else {
      mountSearchComponent(message);
    }
  } else if (
    message === Message.TAB_DATA_UPDATE &&
    isOpen &&
    currentSearchMode === SearchMode.TAB_SEARCH
  ) {
    // most of the checks here are not needed, but it is still good to make sure
    updateTabSearchComponent(
      (messagePayload as UpdatedTabDataMessagePayload).updatedTabData
    );
  } else if (message === Message.CHECK_SEARCH_OPEN) {
    // message used to check the current status of the search modal in thispage
    sendResponse({ isOpen, currentSearchMode})
  }
});

function mountSearchComponent(message: Message) {
  // Message.TOGGLE_TAB_ACTIONS | Message.TOGGLE_TAB_SEARCH
  if (message === Message.TOGGLE_TAB_ACTIONS) {
    // render it normally with actions as the received data
    // should we moint the compoenent first before we make it visible
    tabButlerModalRoot.classList.toggle("is_visible");
    attachListeners();
    reactRoot = ReactDOM.createRoot(shadow);
    const searchComponentInstance = React.createElement(Search, {
      shadowRoot: shadow,
      searchMode: SearchMode.TAB_ACTIONS,
      actions: getActions(),
    });
    reactRoot.render(searchComponentInstance);
    currentSearchMode = SearchMode.TAB_ACTIONS;
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
      attachListeners();
      reactRoot = ReactDOM.createRoot(shadow);
      const searchComponentInstance = React.createElement(Search, {
        shadowRoot: shadow,
        searchMode: SearchMode.TAB_SEARCH,
        currentTabs: response,
      });
      reactRoot.render(searchComponentInstance);
      currentSearchMode = SearchMode.TAB_SEARCH;
      isOpen = true;
      // try and cache tabData array
      // the only times it should not be "used" is if the component is unmounted
      // it migtn have to be cleared after a period of time
    });
  }
}

function unmountSearchComponentFromMessage(message: Message) {
  // NOTE: THIS FUNCTIONS IS ONLY RUN IF THE SEARCH COMPONENT IS OPEN, SO CODE IN THAT ASSUMPTIONKJ
  // Message.TOGGLE_TAB_ACTIONS | Message.TOGGLE_TAB_SEARCH
  // get the accosiated search type of the message
  let requestedSearchMode = getSearchMode(message);
  if (currentSearchMode === requestedSearchMode) {
    // if the search type of the currently open search compenent is the same
    // as the the received one, the user issued the same command
    // meaning they just want to toggle it off
    unmountSearchComponent();
  } else {
    // in this case, the user wants to switch to a different search type
    // update the props of the component with the nessecary information
    // and update the cuttent search mode
    if (requestedSearchMode === SearchMode.TAB_ACTIONS) {
      const newComponentInstance = React.createElement(Search, {
        shadowRoot: shadow,
        searchMode: requestedSearchMode,
        actions: getActions(),
      });
      reactRoot?.render(newComponentInstance);
      currentSearchMode = requestedSearchMode;
      // we know that is still open
    } else {
      const messagePayload = {
        message: Message.GET_TAB_DATA,
      };
      chrome.runtime.sendMessage(messagePayload, (response: TabData[]) => {
        const searchComponentInstance = React.createElement(Search, {
          shadowRoot: shadow,
          searchMode: requestedSearchMode,
          currentTabs: response,
        });
        reactRoot?.render(searchComponentInstance);
        currentSearchMode = requestedSearchMode;
        // we know that is still open
      });
    }
  }
}

function unmountSearchComponent() {
  tabButlerModalRoot.classList.toggle("is_visible");
  removeListeners();
  reactRoot?.unmount();
  // clear the remaining styles in the shadow root
  while (shadow.firstChild) {
    shadow.removeChild(shadow.firstChild);
  }
  reactRoot = null;
  isOpen = false;
  // should i reset currentSearchMode?
}

function updateTabSearchComponent(updatedTabData: TabData[]) {
  const searchComponentInstance = React.createElement(Search, {
    shadowRoot: shadow,
    searchMode: currentSearchMode, // in this case, we know that this is SearchMode.TAB_SEARCH
    currentTabs: updatedTabData,
  });
  reactRoot?.render(searchComponentInstance);
  // no need for further updates as nothing really chanches (apart from the tab data)
  // updateStoredState(true, currentSearchMode);
}

// remove these listeners on page exit
console.log("hello");
// window.addEventListener("click", (event) => {
//   console.log(event.target === tabButlerModalRoot)
//   if (event.target === tabButlerModalRoot) {
//     unmountSearchComponent();
//   }
// });

// move all the listeners to the Component mount
// then remove them on unmont

const attachListeners = () => {
  // remove these listeners on page exit/ compoenent mount
  document.addEventListener("keydown", onKeyDown, true);
  // remove these listeners on page exit
  document.addEventListener("visibilitychange", onVisibilityCahange);
  document.addEventListener("click", unmountOnEscape);
};

const removeListeners = () => {
  document.removeEventListener("keydown", onKeyDown, true);
  document.removeEventListener("visibilitychange", onVisibilityCahange);
  document.removeEventListener("click", unmountOnEscape);
};

const unmountOnEscape = (event: MouseEvent) => {
  // dont like this
  console.log(event.target);
  if (event.target === tabButlerModalRoot) {
    // toggleModal();
    unmountSearchComponent();
  }
};

const onKeyDown = (event: KeyboardEvent) => {
  // this is neccessary to stop some sites from preventing some key strokes from being registered
  event.stopPropagation();
  const eventKey = event.key.toLowerCase();
  if (eventKey === "escape" && isOpen) {
    // toggleModal();
    unmountSearchComponent();
  }
};

const onVisibilityCahange = () => {
  if (document.visibilityState === "hidden" && isOpen) {
    unmountSearchComponent();
  }
};


document.body.appendChild(tabButlerModalRoot); // is there a possibility that document.body is null?
