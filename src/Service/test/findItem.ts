export type Item = Record<string, unknown>;
export type Items = Item[];
export type Query = Record<string, unknown>;

/** Finds item in a list using query. */
const findItem = (items: Items, query: Query): Item | undefined =>
  items.find(item => {
    for (const key in query) {
      const queryValue = query[key];
      const itemValue = item[key];

      const isMatch = itemValue === queryValue;

      if (!isMatch) {
        return false;
      }
    }

    return true;
  });

export default findItem;
