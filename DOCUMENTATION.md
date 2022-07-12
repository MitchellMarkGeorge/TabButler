## Documentation

The purpose of this document is to document the structure of the project so that it can be easier for users to contribute to.

Note: I highly encourage you to look into the general structure of browser extensions so you can better understand this project. [This](https://developer.chrome.com/docs/extensions/mv3/getstarted/) is a good source for Chrome and [this](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) is a good source from Mozilla.

### Overview

The extension was initially built with only Chrome in mind (look at older commits). Over time, the extension became more cross-platform and should work on Chromium-based browsers and Firefox (two that have been tested). This cross-platform functionality is provided by the [Web Extension Polyfill.](https://github.com/mozilla/webextension-polyfill)

The extension is split into 2 main parts:

*   The Content Script → the script that is injected into every website that the user visits. This is responsible for showing the main Search modal to the user.
*   The Background Script → the script/service worker that runs in the background of the browser. This is responsible for handling inputted shortcuts from the user, showing the welcome page on install, and handling (and sending) messages from the content script.

The two parts communicate to and fro using the provided message API from the browser, and they follow a specified “format”. This format is basically a simple object with a `message` field and any necessary data. Based on the value of the `message` field, the receiving end does the appropriate action. This code can be found in `common/types`.

### Code Structure

The code structure is quite simple:

*   `src` → folder for main source code
    *   `background` → folder for related background script code
    *   `icons` → folder for any needed icons
    *   `assets` →any project assets.
    *   `common` → folder for common functions and types that both the content script and the background script can use (like the messages that are sent between them).
    *   `content` → folder for content script-related code
        *   `component` → folder for all the React components used in rendering the Search component.
    *   `welcome`→ folder for all welcome page-related code.
*   `manifest.json` → config file that browsers use to load extensions
*   `manifest.firefox.json` → specific manifest.json for Firefox.

More in-depth explanation for each section is soon to come!

### Developing

Depending on what browser you are developing for, use the steps found in the [README](/README.md) of this project.

Make sure you format your code before submitting it for review!