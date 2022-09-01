
  export const getHostname = (url: string) => {
    return new URL(url).hostname;
  };