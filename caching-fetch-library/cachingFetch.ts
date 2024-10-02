// You may edit this file, add new files to support this file,
// and/or add new dependencies to the project as you see fit.
// However, you must not change the surface API presented from this file,
// and you should not need to change any other files in the project to complete the challenge

import React from 'react';

import { getValidClientCache, setClientCache } from './clientCache';

import { CacheDataServer, Person } from './types';
import { SS_CACHE_EXPIRY } from './constants';

type CustomCache = {
  [key: string]: CacheDataServer;
};

declare global {
  interface Window {
    customCache: CustomCache;
  }
}

type UseCachingFetch = (url: string) => {
  isLoading: boolean;
  data: Person[] | null;
  error: Error | null;
};

const memoryCache: Record<string, CacheDataServer> = {};

export const getMemoryCache = (key: string): false | CacheDataServer => {
  const cacheData = memoryCache[key];
  if (!cacheData) {
    return false;
  }

  if (Date.now() > cacheData.expiresAt) {
    delete memoryCache[key];
    return false;
  }

  if (cacheData.data === null) {
    return false;
  }

  return cacheData;
};

/**
 * 1. Implement a caching fetch hook. The hook should return an object with the following properties:
 * - isLoading: a boolean that is true when the fetch is in progress and false otherwise
 * - data: the data returned from the fetch, or null if the fetch has not completed
 * - error: an error object if the fetch fails, or null if the fetch is successful
 *
 * This hook is called three times on the client:
 *  - 1 in App.tsx
 *  - 2 in Person.tsx
 *  - 3 in Name.tsx
 *
 * Acceptance Criteria:
 * 1. The application at /appWithoutSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should only see 1 network request in the browser's network tab when visiting the /appWithoutSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const useCachingFetch: UseCachingFetch = (url) => {
  const [data, setData] = React.useState<Person[] | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  if (typeof window !== 'undefined') {
    if (window.customCache) {
      const cache = window.customCache;
      if (cache[url]) {
        const cacheData = cache[url];
        if (Date.now() < cacheData.expiresAt) {
          return {
            data: cacheData.data,
            isLoading: false,
            error: cacheData.error,
          };
        }
      }
    }
  }

  const memoryCacheData = getMemoryCache(url);
  if (memoryCacheData) {
    return {
      data: memoryCacheData.data,
      isLoading: false,
      error: memoryCacheData.error,
    };
  }

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);

    const cacheData = getValidClientCache(url);
    if (cacheData) {
      setData(cacheData);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      setData(data);
      setClientCache(url, data);
    } catch (error) {
      if (typeof error === 'string') {
        setError(new Error(error));
        return;
      }

      if (error instanceof Error) {
        setError(error);
        return;
      }

      setError(new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
  };
};

/**
 * 2. Implement a preloading caching fetch function. The function should fetch the data.
 *
 * This function will be called once on the server before any rendering occurs.
 *
 * Any subsequent call to useCachingFetch should result in the returned data being available immediately.
 * Meaning that the page should be completely serverside rendered on /appWithSSRData
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript disabled, you should see a list of people.
 * 2. You have not changed any code outside of this file to achieve this.
 * 3. This file passes a type-check.
 *
 */
export const preloadCachingFetch = async (url: string): Promise<void> => {
  const expiresAt = Date.now() + SS_CACHE_EXPIRY;
  try {
    const response = await fetch(url);
    const data: Person[] = await response.json();
    memoryCache[url] = {
      data,
      error: null,
      expiresAt,
    };
  } catch (error) {
    let errorObj: Error | string | null = null;
    if (typeof error === 'string') {
      errorObj = new Error(error);
    }
    if (error instanceof Error) {
      errorObj = error;
    }

    if (!errorObj) {
      errorObj = new Error('An unknown error occurred');
    }

    memoryCache[url] = {
      data: null,
      error: errorObj,
      expiresAt,
    };
  }
};

/**
 * 3.1 Implement a serializeCache function that serializes the cache to a string.
 * 3.2 Implement an initializeCache function that initializes the cache from a serialized cache string.
 *
 * Together, these two functions will help the framework transfer your cache to the browser.
 *
 * The framework will call `serializeCache` on the server to serialize the cache to a string and inject it into the dom.
 * The framework will then call `initializeCache` on the browser with the serialized cache string to initialize the cache.
 *
 * Acceptance Criteria:
 * 1. The application at /appWithSSRData should properly render, with JavaScript enabled, you should see a list of people.
 * 2. You should not see any network calls to the people API when visiting the /appWithSSRData route.
 * 3. You have not changed any code outside of this file to achieve this.
 * 4. This file passes a type-check.
 *
 */
export const serializeCache = (): string => {
  return JSON.stringify(memoryCache);
};

export const initializeCache = (serializedCache: string): void => {
  try {
    const cache = JSON.parse(serializedCache);
    window.customCache = cache;
  } catch (error) {
    console.error('Error initializing cache', error);
  }
};

export const wipeCache = (): void => {
  Object.keys(memoryCache).forEach((key) => {
    delete memoryCache[key];
  });
  if (typeof window !== 'undefined') {
    localStorage.clear();
    window.customCache = {};
  }
};
