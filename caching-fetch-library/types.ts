export type Person = {
  first: string;
  last: string;
  email: string;
  address: string;
  created: string;
  balance: string;
};

export type CacheData = {
  data: Person[];
  expiresAt: number;
};

export type CacheDataServer = {
  data: Person[] | null;
  error: Error | null;
  expiresAt: number;
};
