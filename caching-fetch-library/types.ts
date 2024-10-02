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
