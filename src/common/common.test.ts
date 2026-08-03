import { describe, it, expect } from "vitest";
import { isChromeURL, isFirefoxURL } from "./common";

describe("isChromeURL", () => {
  it("matches chrome:// URLs", () => {
    expect(isChromeURL("chrome://settings")).toBe(true);
  });

  it("matches chrome-extension:// URLs", () => {
    expect(isChromeURL("chrome-extension://abc123/popup.html")).toBe(true);
  });

  it("matches Chrome Web Store URLs", () => {
    expect(isChromeURL("https://chrome.google.com/webstore")).toBe(true);
  });

  it("does not match regular URLs", () => {
    expect(isChromeURL("https://example.com")).toBe(false);
    expect(isChromeURL("https://mozilla.org")).toBe(false);
  });
});

describe("isFirefoxURL", () => {
  it("matches about: URLs", () => {
    expect(isFirefoxURL("about:blank")).toBe(true);
    expect(isFirefoxURL("about:newtab")).toBe(true);
  });

  it("matches moz-extension:// URLs", () => {
    expect(isFirefoxURL("moz-extension://abc123/popup.html")).toBe(true);
  });

  it("does not match regular URLs", () => {
    expect(isFirefoxURL("https://example.com")).toBe(false);
  });
});
