import "./welcome.css";
import browser from "webextension-polyfill";

document.addEventListener("DOMContentLoaded", () => {
  console.log("loaded")
  const searchMacCommandElement = document.getElementById(
    "search-command-other",
  );
  const actionMacCommandElement = document.getElementById(
    "action-command-other",
  );
  const searchOtherCommandElement = document.getElementById(
    "search-command-other",
  );
  const actionOtherCommandElement = document.getElementById(
    "action-command-other",
  );

  const linkElement = document.querySelector(".container span");

  // also use this page as the options page so th user can go back and see the options
  if (navigator.userAgent.includes("Mac")) {
    // searchOtherCommandElement.style.display = "none";
    // actionOtherCommandElement.style.display = "none";
    searchOtherCommandElement?.remove();
    actionOtherCommandElement?.remove();
  } else {
    // searchMacCommandElement.style.display = "none";
    // actionMacCommandElement.style.display = "none";
    searchMacCommandElement?.remove();
    actionMacCommandElement?.remove();
  }

  linkElement?.addEventListener("click", () => {
    // workarround to open extensions shortcut link
    console.log("here")
    browser.tabs.create({ url: "chrome://extensions/shortcuts" });
  });
});
