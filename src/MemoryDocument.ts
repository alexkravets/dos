import { got } from '@kravc/schema';
import Document from './Document';
import { QueryMap } from './Context';
import { get, cloneDeep } from 'lodash';

type Item = {
  id: string;
  [index: string]: unknown;
};

const _MEMORY_STORE = {} as Record<string, Record<string, Item>>;

/** Document stored in memory. */
class MemoryDocument<T> extends Document<T> {
  /** Implements storage interface to get documents in batches. */
  static async _index<T>(query: QueryMap): Promise<{
    count: number;
    items: T[];
    lastEvaluatedKey?: string;
  }> {
    const collectionName = this.name;
    const collection = _MEMORY_STORE[collectionName] || {};

    /** Filters result item to match query. */
    const filter = (item: Item) =>
      Object
        .keys(query)
        .every(key => item[key] === query[key]);

    const items = Object
      .values(collection)
      .filter(filter)
      .map(cloneDeep) as T[];

    const count = items.length;

    return {
      items,
      count,
      lastEvaluatedKey: undefined,
    };
  }

  /** Implements storage interface to get all documents. */
  static async _indexAll<T>(query: QueryMap) {
    const { items, count } = await this._index<T>(query);

    return {
      items,
      count,
    };
  }

  /** Implements storage interface to get a document. */
  static async _read<T>(query: QueryMap) {
    const idValue = got(query, this.idKey, 'Query parameter "$PATH" is required') as string;

    const collectionName = this.name;
    const collection = _MEMORY_STORE[collectionName] || {};

    const item = get(collection, idValue) as T;

    return cloneDeep(item);
  }
}

export default MemoryDocument;
