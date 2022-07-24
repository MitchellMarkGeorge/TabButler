import browser from "webextension-polyfill";
import {
  getSearchMode,
  Message,
  MessagePlayload,
  SearchMode,
  TabData,
  UpdatedTabDataMessagePayload,
} from "../common/types";
import { getActions } from "./actions";
import "./content.css";
import { SearchUIHandler } from "./SearchUIHandler";
import { getCurrentTabData } from "./utils";

// if there is already a modal element in the dom (meaning there was an update), remove the existing one and create a new one
// this should unmount the react component and remove the shadow dom. for now this leaves some listeners attached but it should not affect any functionality
const existingTabButlerModalRoot = document.querySelector("tab-butler-modal");
if (existingTabButlerModalRoot) {
  existingTabButlerModalRoot.remove();
}
const tabButlerModalRoot = document.createElement("tab-butler-modal");
// needs to be open so that the click event can bubble up
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

    case Message.TAB_DATA_UPDATE:
      if (isOpen && currentSearchMode === SearchMode.TAB_SEARCH) {
        // most of the checks here are not needed, but it is still good to make sure
        const { updatedTabData } =
          messagePayload as UpdatedTabDataMessagePayload;
        searchUiHandler.updateProps({ currentTabs: updatedTabData });
      }
      break;

    case Message.CHECK_SEARCH_OPEN:
      return Promise.resolve({ isOpen, currentSearchMode });
  }
};
browser.runtime.onMessage.addListener(messageListener);

function mountSearchComponent(message: Message) {
  // this definately needs to be refactored
  // most of this stuff should reside in the Search component itself
  if (message === Message.TOGGLE_TAB_ACTIONS) {
    // render it normally with actions as the received data
    // should we moint the compoenent first before we make it visible
    attachListeners();
    searchUiHandler.mount(shadow, {
      shadowRoot: shadow,
      searchMode: SearchMode.TAB_ACTIONS,
      actions: getActions(),
      close: unmountSearchComponent,
      hasError: false,
    });
    tabButlerModalRoot.classList.toggle("tab_butler_modal_visible");
    currentSearchMode = SearchMode.TAB_ACTIONS;
    isOpen = true;
  } else {
    // default to search
    getCurrentTabData()
      .then((response) => {
        // going to leave this in here as we need to wait for the responce before making the modal root visible
        // all the needed data should be present before anything is mounted
        attachListeners();
        searchUiHandler.mount(shadow, {
          shadowRoot: shadow,
          searchMode: SearchMode.TAB_SEARCH,
          currentTabs: response,
          close: unmountSearchComponent,
          hasError: false,
        });
        tabButlerModalRoot.classList.toggle("tab_butler_modal_visible");
        currentSearchMode = SearchMode.TAB_SEARCH;
        isOpen = true;
      })
      .catch(() => {
        attachListeners();
        searchUiHandler.mount(shadow, {
          shadowRoot: shadow,
          searchMode: SearchMode.TAB_SEARCH,
          currentTabs: [],
          close: unmountSearchComponent,
          hasError: true,
        });
        tabButlerModalRoot.classList.toggle("tab_butler_modal_visible");
        currentSearchMode = SearchMode.TAB_SEARCH;
        isOpen = true;
      });
  }
}

function unmountSearchComponentFromMessage(message: Message) {
  // NOTE: THIS FUNCTIONS IS ONLY RUN IF THE SEARCH COMPONENT IS OPEN, SO CODE IN THAT ASSUMPTIONKJ
  // Message.TOGGLE_TAB_ACTIONS | Message.TOGGLE_TAB_SEARCH
  // get the accosiated search type of the message
  const requestedSearchMode = getSearchMode(message);
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
      searchUiHandler.updateProps({
        searchMode: requestedSearchMode,
        actions: getActions(),
      });
      currentSearchMode = requestedSearchMode;
    } else {
      getCurrentTabData()
        .then((response) => {
          searchUiHandler.updateProps({
            searchMode: requestedSearchMode,
            currentTabs: response,
          });
          currentSearchMode = requestedSearchMode;
        })
        .catch(() => {
          searchUiHandler.updateProps({ hasError: true });
        });
    }
  }
}

function unmountSearchComponent() {
  // doing this first here so it disapears as soon as possible
  tabButlerModalRoot.classList.toggle("tab_butler_modal_visible");
  removeListeners();
  searchUiHandler.unMount();
  // clear the remaining styles in the shadow root
  while (shadow.firstChild) {
    shadow.removeChild(shadow.firstChild);
  }
  isOpen = false;
  // should i reset currentSearchMode?
}

const attachListeners = () => {
  document.addEventListener("keydown", unmountOnEscape, true);
  document.addEventListener("visibilitychange", onVisibilityChange, false);
  document.addEventListener("click", unmountOnClick);
};

const removeListeners = () => {
  document.removeEventListener("keydown", unmountOnEscape, true);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  document.removeEventListener("click", unmountOnClick);
};

const unmountOnClick = (event: MouseEvent) => {
  // see if there is a better way to do this
  // this details the path that the document click event bubbled up from
  const [firstElementTarget] = (event as PointerEvent).composedPath();
  // if the user clicked on the overlay
  if (firstElementTarget === tabButlerModalRoot) {
    unmountSearchComponent();
  }
};

// need to make sure this works as intended
const unmountOnEscape = (event: KeyboardEvent) => {
  // this is neccessary to stop some sites from preventing some key strokes from being registered
  event.stopPropagation();
  if (event.key === "Escape" && isOpen) {
    unmountSearchComponent();
  }
};

const onVisibilityChange = () => {
  // think about this... do users want it to remain open once they leave a page
  // AS OF RIGHT NOW: if the user switch tabs using the modal (or any action), it should automatically close
  // if the user simply goes to another tab manually (like they usually would), it should stay open in case they still want to use it
  // this is called only when the page was once not visible (like the user whent to another tab) and it has become visible again.
  if (
    document.visibilityState === "visible" &&
    isOpen && // technically not needed as we know that will be
    currentSearchMode === SearchMode.TAB_SEARCH
  ) {
    // if the document is now visible and was previously inactive and a tab search modal was open
    // get the updated tab data
    // should this be here??
    // isPageActive = true;
    // for some reason this event keeps throwing an Extension context invalidated error... this might
    // the probelem is that a potential previous content script is still trying to send this message
    // and since it has been "cut off" by the extension, it is invalidated
    // functionality still works, but might need a way to handle this
    // can probably make this into a promise like method
    // this is only a problem in devlopment due to the ammount of times we "update"/refresh the extension
    // in production, this might only happen if the user updates the extension and the old content script is stll there
    getCurrentTabData()
      .then((updatedTabData: TabData[]) => {
        searchUiHandler.updateProps({ currentTabs: updatedTabData });
      })
      .catch(() => {
        // this can happen if the context is invalidated (meaning that there has been an update and this tab is still trying to talk with the extension)
        // show error telling user to reload page
        // since we are injecting the extension on update, it might be wise to figgure out a better way to do this
        searchUiHandler.updateProps({ hasError: true });
        // }
      });
  }
};

window.addEventListener("beforeunload", () => {
  if (isOpen) {
    unmountSearchComponent();
  }
});

document.body.appendChild(tabButlerModalRoot); // is there a possibility that document.body is null?
