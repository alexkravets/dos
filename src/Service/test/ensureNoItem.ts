import findItem, { type Items, type Query } from './findItem';

/** Ensures item does not exist in a list for specified query. */
const ensureNoItem = (data: Items, query: Query) => {
  const item = findItem(data, query);
  expect(item).toBeUndefined();
};

export default ensureNoItem;
