import { describe, it, expect, vi } from "vitest";

vi.mock("webextension-polyfill", () => ({
  default: {
    runtime: {
      getURL: (path: string) => `chrome-extension://fake-id${path}`,
    },
  },
}));

import { getHostname, getFaviconURL } from "./utils";

describe("getHostname", () => {
  it("extracts hostname from a simple URL", () => {
    expect(getHostname("https://example.com/path")).toBe("example.com");
  });

  it("extracts hostname with subdomain", () => {
    expect(getHostname("https://www.google.com/search?q=test")).toBe(
      "www.google.com"
    );
  });

  it("handles URLs with ports", () => {
    expect(getHostname("http://localhost:3000/app")).toBe("localhost");
  });
});

describe("getFaviconURL", () => {
  it("builds a favicon URL with the correct query params", () => {
    const result = getFaviconURL("https://example.com");
    expect(result).toContain("pageUrl=https%3A%2F%2Fexample.com");
    expect(result).toContain("size=24");
  });
});
