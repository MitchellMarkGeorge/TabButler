export const isDev = true;

export function isChromeURL(url: string) {
  // not all urls might actually start with this
  // the chrome webstore might have a http like protocon infront
  return (
    // use .includes() for the rest?
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    // extension webstore
    url.includes("chrome.google.com")
  );
}
