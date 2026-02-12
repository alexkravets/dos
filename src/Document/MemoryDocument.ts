import { got } from '@kravc/schema';
import Context, { type QueryMap, type MutationMap } from '../Context';
import { get, set,  last, unset, cloneDeep, sortBy } from 'lodash';
import { DocumentExistsError, DocumentNotFoundError } from '../Operation';
import Document, { type IndexOptions, type IndexAllOptions } from './Document';

type Item = {
  id: string;
  [index: string]: unknown;
};

const _MEMORY_STORE = {} as Record<string, Record<string, Item>>;

const QUERY_ERROR_TEMPLATE = 'Query parameter "$PATH" is required';
const ATTRIBUTE_ERROR_TEMPLATE = 'Attribute "$PATH" is required';

/** Example implementation of a document class stored in memory. */
class MemoryDocument<T> extends Document<T> {
  /** Returns collection where documents are stored. */
  static get collection() {
    const collectionName = this.name;

    const hasCollection = !!_MEMORY_STORE[collectionName];

    if (!hasCollection) {
      _MEMORY_STORE[collectionName] = {};
    }

    return _MEMORY_STORE[collectionName];
  }

  /** Resets collection. */
  static async reset() {
    const collectionName = this.name;

    delete _MEMORY_STORE[collectionName];
  }

  /** Implements interface to get documents in batches. */
  static async _index<T>(query: QueryMap, options: IndexOptions): Promise<{
    count: number;
    items: T[];
    lastEvaluatedKey?: string;
  }> {
    const {
      sort,
      limit,
      exclusiveStartKey
    } = options;

    /** Filters result item to match query. */
    const filter = (item: Item) =>
      Object
        .keys(query)
        .every(key => item[key] === query[key]);

    const sortedItems = sort === 'desc'
      ? sortBy(Object.values(this.collection), this.indexSortBy).reverse()
      : sortBy(Object.values(this.collection), this.indexSortBy);

    const filteredItems = sortedItems
      .filter(filter)
      .map(cloneDeep) as T[];

    let exclusiveStartKeyIndex = -1;

    if (exclusiveStartKey) {
      exclusiveStartKeyIndex = filteredItems
        .findIndex(item => got(item, this.idKey) === exclusiveStartKey);
    }

    const items = limit
      ? filteredItems.slice(exclusiveStartKeyIndex + 1, exclusiveStartKeyIndex + 1 + limit)
      : filteredItems.slice(exclusiveStartKeyIndex + 1, filteredItems.length);

    const count = items.length;

    let lastEvaluatedKey = get(last(items), this.idKey);

    const isLastItemIncluded = get(last(sortedItems), this.idKey) === lastEvaluatedKey;

    if (isLastItemIncluded) {
      lastEvaluatedKey = undefined;
    }

    return {
      items,
      count,
      lastEvaluatedKey,
    };
  }

  /** Implements interface to get all documents. */
  static async _indexAll<T>(query: QueryMap, options: IndexAllOptions): Promise<{
    count: number;
    items: T[];
  }> {
    const { items, count } = await this._index<T>(query, options);

    return {
      items,
      count,
    };
  }

  /** Implements interface to get a document. */
  static async _read<T>(query: QueryMap): Promise<T> {
    const idValue = got(query, this.idKey, QUERY_ERROR_TEMPLATE) as string;

    const item = get(this.collection, idValue) as T;

    if (!item) {
      throw new DocumentNotFoundError(this, query);
    }

    return cloneDeep(item);
  }

  /** Implements interface to save a document. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async _create<T>(attributes: T, _context: Context): Promise<void> {
    const idValue = got(attributes, this.idKey, ATTRIBUTE_ERROR_TEMPLATE) as string;

    const item = get(this.collection, idValue) as T;

    if (item) {
      throw new DocumentExistsError(this, attributes as Record<string, unknown>);
    }

    set(this.collection, idValue, attributes);
  }

  /** Implements interface to update a document. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async _update<T>(query: QueryMap, mutation: MutationMap, _context: Context): Promise<T> {
    const idValue = got(query, this.idKey, QUERY_ERROR_TEMPLATE) as string;

    const componentTitle = this.getTitle();
    const item = got(this.collection, idValue, `${componentTitle} with ID "$PATH" is not found`) as T;

    set(this.collection, idValue, { ...item, ...mutation });

    return cloneDeep({ ...item, ...mutation });
  }

  /** Implements interface to delete a document. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async _delete<T>(query: QueryMap, _context: Context): Promise<void> {
    const idValue = got(query, this.idKey, QUERY_ERROR_TEMPLATE) as string;

    const componentTitle = this.getTitle();
    got(this.collection, idValue, `${componentTitle} with ID "$PATH" is not found`) as T;

    unset(this.collection, idValue);
  }
}

export default MemoryDocument;
