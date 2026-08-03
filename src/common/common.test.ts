import { describe, it, expect } from "vitest";
import { isChromeURL, isFirefoxURL } from "./common";

describe("isChromeURL", () => {
  it("returns true for chrome:// URLs", () => {
    expect(isChromeURL("chrome://settings")).toBe(true);
  });

  it("returns true for chrome-extension:// URLs", () => {
    expect(isChromeURL("chrome-extension://abc123/popup.html")).toBe(true);
  });

  it("returns true for chrome webstore URLs", () => {
    expect(isChromeURL("https://chrome.google.com/webstore")).toBe(true);
  });

  it("returns false for regular https URLs", () => {
    expect(isChromeURL("https://example.com")).toBe(false);
  });

  it("returns false for firefox URLs", () => {
    expect(isChromeURL("about:blank")).toBe(false);
    expect(isChromeURL("moz-extension://abc/popup.html")).toBe(false);
  });
});

describe("isFirefoxURL", () => {
  it("returns true for about: URLs", () => {
    expect(isFirefoxURL("about:blank")).toBe(true);
    expect(isFirefoxURL("about:newtab")).toBe(true);
  });

  it("returns true for moz-extension:// URLs", () => {
    expect(isFirefoxURL("moz-extension://abc123/popup.html")).toBe(true);
  });

  it("returns false for regular https URLs", () => {
    expect(isFirefoxURL("https://example.com")).toBe(false);
  });

  it("returns false for chrome URLs", () => {
    expect(isFirefoxURL("chrome://settings")).toBe(false);
    expect(isFirefoxURL("chrome-extension://abc/popup.html")).toBe(false);
  });
});
