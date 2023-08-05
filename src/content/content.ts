import browser from "webextension-polyfill";
import {
  Message,
  MessagePlayload,
} from "../common/types";
// import "./content.css";
import { SearchUIHandler } from "./SearchUIHandler";

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
const searchUiHandler = new SearchUIHandler();

const messageListener = (messagePayload: MessagePlayload) => {
  // i will need to rename the component from search to something else
  const { message } = messagePayload;
  switch (message) {
    case Message.TOGGLE_TAB_BUTLER_MODAL:
      if (isOpen) {
        unmountModal();
      } else {
        mountModal();
      }
      break;
    case Message.CHECK_SEARCH_OPEN:
      return Promise.resolve({ isOpen });
  }
}
browser.runtime.onMessage.addListener(messageListener);

// figure out nodal mechanics
// this could technically go on the :host selector...
const styleModalRoot = (modalRoot: HTMLElement) => {
  modalRoot.style.position = "fixed";
  // modalRoot.style.left = "0";
  // modalRoot.style.right = "0";
  // modalRoot.style.bottom = "0";
  // modalRoot.style.top = "0";
  // modalRoot.style.display = "flex";
  // modalRoot.style.justifyContent = "center";
  modalRoot.style.boxSizing = "border-box";
  // modalRoot.style.paddingTop = "20vh";
  modalRoot.style.width = "100%";
  modalRoot.style.height = "100%";
  modalRoot.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modalRoot.style.zIndex = "999999";
};

function mountModal() {
  // create a new modal root on mount and append as the last child of the body
  tabButlerModalRoot = document.createElement("tab-butler-modal");
  // styleModalRoot(tabButlerModalRoot);
  // needs to be open so that the click event can bubble up
  tabButlerModalRoot.attachShadow({ mode: "open" });
  document.addEventListener("click", unmountOnClick);
  searchUiHandler.mount(tabButlerModalRoot.shadowRoot as ShadowRoot, {
    close: unmountModal,
  });
  isOpen = true;
  // document.body.appendChild(tabButlerModalRoot);
  // inserts the modal as the first child 
  // this is needed for it to work with the new syles
  // should confirm this
  document.body.insertAdjacentElement("afterbegin", tabButlerModalRoot);
}

function unmountModal() {
  document.removeEventListener("click", unmountOnClick);
  searchUiHandler.unMount();
  tabButlerModalRoot?.remove();
  tabButlerModalRoot = null;
  isOpen = false;
}

const unmountOnClick = (event: MouseEvent) => {
  // see if there is a better way to do this
  // this details the path that the document click event bubbled up from
  const [firstElementTarget] = (event as PointerEvent).composedPath();
  // if the user clicked on the overlay
  if (firstElementTarget === tabButlerModalRoot) {
    unmountModal();
  }
};

function shutdownScript() {
  console.log("shutting down");
  unmountModal();
  // remove the listener to so it can't be triggered again
  // this prevents any old content scripts in the tab from being triggered in the tab
  browser.runtime.onMessage.removeListener(messageListener);
}

window.addEventListener("beforeunload", () => {
  if (isOpen) {
    unmountModal();
  }
});
