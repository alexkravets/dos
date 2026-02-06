import { got } from '@kravc/schema';
import Document from './Document';
import { get, set, unset, cloneDeep } from 'lodash';
import type { QueryMap, MutationMap } from '../Context';
import { DocumentExistsError, DocumentNotFoundError } from '../Operation';

type Item = {
  id: string;
  [index: string]: unknown;
};

const _MEMORY_STORE = {} as Record<string, Record<string, Item>>;

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

    _MEMORY_STORE[collectionName] = {};
  }

  /** Implements interface to get documents in batches. */
  static async _index<T>(query: QueryMap): Promise<{
    count: number;
    items: T[];
    lastEvaluatedKey?: string;
  }> {
    /** Filters result item to match query. */
    const filter = (item: Item) =>
      Object
        .keys(query)
        .every(key => item[key] === query[key]);

    // TODO: Add sorted collection.

    // TODO: Add support for limit.

    // TODO: Add support for exclusiveStartKey.

    const items = Object
      .values(this.collection)
      .filter(filter)
      .map(cloneDeep) as T[];

    const count = items.length;

    // TODO: Add support for lastEvaluatedKey.

    if (count > 1000) {
      console.log('TODO');
    }

    return {
      items,
      count,
      lastEvaluatedKey: undefined,
    };
  }

  /** Implements interface to get all documents. */
  static async _indexAll<T>(query: QueryMap): Promise<{
    count: number;
    items: T[];
  }> {
    const { items, count } = await this._index<T>(query);

    return {
      items,
      count,
    };
  }

  /** Implements interface to get a document. */
  static async _read<T>(query: QueryMap): Promise<T> {
    const idValue = got(query, this.idKey, 'Query parameter "$PATH" is required') as string;

    const item = get(this.collection, idValue) as T;

    if (!item) {
      throw new DocumentNotFoundError(this, query);
    }

    return cloneDeep(item);
  }

  /** Implements interface to save a document, returns false if document is not created. */
  static async _create<T>(attributes: T): Promise<void> {
    const idValue = got(attributes as Record<string, string>, this.idKey, 'Attribute "$PATH" is required');

    const item = get(this.collection, idValue) as T;

    if (item) {
      throw new DocumentExistsError(this, attributes as Record<string, unknown>);
    }

    set(this.collection, idValue, attributes);
  }

  /** Implements interface to update a document. */
  static async _update<T>(query: QueryMap, mutation: MutationMap): Promise<T> {
    const idValue = got(query, this.idKey, 'Query parameter "$PATH" is required') as string;

    const item = get(this.collection, idValue) as T;

    if (!item) {
      throw new DocumentNotFoundError(this, query);
    }

    set(this.collection, idValue, { ...item, ...mutation });

    return cloneDeep({ ...item, ...mutation });
  }

  /** Implements interface to delete a document. */
  static async _delete<T>(query: QueryMap): Promise<void> {
    const idValue = got(query, this.idKey, 'Query parameter "$PATH" is required') as string;

    const componentTitle = this.getTitle();
    got(this.collection, idValue, `${componentTitle} with ID "$PATH" is not found`) as T;

    unset(this.collection, idValue);
  }
}

export default MemoryDocument;
