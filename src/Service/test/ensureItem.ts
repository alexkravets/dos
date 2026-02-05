import findItem, { type Items, type Query } from './findItem';

/** Ensures item to exists in a list for specified query. */
const ensureItem = (items: Items, query: Query) => {
  const item = findItem(items, query);
  expect(item).toBeDefined();
};

export default ensureItem;
