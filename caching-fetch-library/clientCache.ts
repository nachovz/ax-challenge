import { Person, CacheData } from './types';

const CACHE_EXPIRY = 1000 * 1; // 1 seconds

export const setClientCache = (key: string, data: Person[]): void => {
  const cacheData: CacheData = {
    data,
    expiresAt: Date.now() + CACHE_EXPIRY,
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
};

export const getValidClientCache = (key: string): false | Person[] => {
  const cacheData = localStorage.getItem(key);
  if (!cacheData) {
    return false;
  }

  try {
    const { data, expiresAt } = JSON.parse(cacheData) as CacheData;
    if (Date.now() > expiresAt) {
      localStorage.removeItem(key);
      return false;
    }

    return data;
  } catch (error) {
    return false;
  }
};
