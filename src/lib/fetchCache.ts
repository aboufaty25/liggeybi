export const cachedFetch = async (url: string, options?: RequestInit) => {
  return fetch(url, options);
};
