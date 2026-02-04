import { ulid } from 'ulid';
import Component from './Component';
import { Schema } from '@kravc/schema';
import type { Context, QueryMap } from './Context';
import { get, capitalize, cloneDeep } from 'lodash';
import { type PropertiesSchemaSource } from '@kravc/schema';

// import { get, omit,  } from 'lodash';
// import { DocumentExistsError, DocumentNotFoundError } from './errors/';

const DEFAULT_ID_KEY = 'id';

// const SYSTEM = 'SYSTEM';
// const IDENTITY_SUBJECT_PATH = 'identity.sub';

type Item = {
  id: string;
  [index: string]: unknown;
};

const _MEMORY_STORE = {} as Record<string, Record<string, Item>>;

type Constructor<T, D extends Document<T> = Document<T>> = {
  new(context: Context, attributes: T): D;
};

type IndexOptions = {
  sort?: 'asc' | 'desc';
  limit?: number;
  index?: string;
  exclusiveStartKey?: string;
}

type IndexAllOptions = {
  sort?: 'asc' | 'desc';
  index?: string;
}

/** Document store in memory storage. */
class Document<Attributes> extends Component<Attributes> {
  private static _bodySchema: Schema;

  /** Returns ID key of a document. */
  static get idKey(): string {
    return DEFAULT_ID_KEY;
  }

  /** Returns prefix for new IDs. */
  static get idPrefix(): string {
    return this.name;
  }

  /** Generates ID for new document unless it's defined in parameters. */
  static createId(attributes: Record<string, undefined>) {
    const id = get(attributes, this.idKey);
    const hasId = !!id;

    if (hasId) {
      return id;
    }

    return `${this.idPrefix}_` + ulid();
  }

  /** Returns default attributes schema source. */
  static get defaultAttributesSchemaSource(): PropertiesSchemaSource {
    const documentTitle = this.getTitle(false);

    return {
      id: {
        description: capitalize(documentTitle) + ' ID',
        required: true
      },
      createdAt: {
        description: `Date and time when ${documentTitle} was created`,
        format: 'date-time',
        required: true
      },
      createdBy: {
        description: `ID of a user who created ${documentTitle}`
      },
      createdByUserFullname: {
        description: `Name of a user who created ${documentTitle}`
      },
      updatedAt: {
        description: `Date and time when ${documentTitle} was updated`,
        format: 'date-time'
      },
      updatedBy: {
        description: `ID of a user who updated ${documentTitle}`
      },
      updatedByUserFullname: {
        description: `Name of a user who updated ${documentTitle}`
      }
    };
  }

  /** Extends document schema with default attributes. */
  static set schema(schema: Schema) {
    this._schema = schema.extend(this.defaultAttributesSchemaSource, this.id);
    this._bodySchema = schema.clone(`${this.id}Body`);
  }

  /** Returns body schema to validate attributes for the update method. */
  static get bodySchema() {
    return this._bodySchema;
  }

  /** Implements storage interface to get documents in batches. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async _index(query: QueryMap, _options: IndexOptions | IndexAllOptions) {
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
      .map(cloneDeep);

    const count = items.length;

    return {
      items,
      count,
      lastEvaluatedKey: undefined,
    };
  }

  /** Implements storage interface to get all documents. */
  static async _indexAll(query: QueryMap, options: IndexAllOptions = {}) {
    return this._index(query, options);
  }

  /** Returns documents in batches. */
  static async index<T, D extends Document<T> = Document<T>>(
    this: Constructor<T, D>,
    context: Context,
    query: QueryMap = {},
    options: IndexOptions = {}
  ): Promise<{
    count: number;
    objects: D[];
    lastEvaluatedKey?: string;
  }> {
    // this._extendWithPartition(context, query);

    const { items, ...rest } = await (this as unknown as typeof Document)._index(query, options);
    const objects = (items as T[]).map(attributes => new this(context, attributes));

    return { objects, ...rest };
  }

  /** Returns all documents. */
  static async indexAll<T, D extends Document<T> = Document<T>>(
    this: Constructor<T, D>,
    context: Context,
    query: QueryMap = {},
    options: IndexAllOptions = {}
  ): Promise<{
    count: number;
    objects: D[];
  }> {
    // this._extendWithPartition(context, query);

    const { items, ...rest } = await (this as unknown as typeof Document)._index(query, options);
    const objects = (items as T[]).map(attributes => new this(context, attributes));

    return { objects, ...rest };
  }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static _extendWithPartition(context, parameters) {
  //   if (!this.getPartition) {
  //     return;
  //   }

  //   parameters.partition = this.getPartition(context, parameters);
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static _extendWithCreatedStamps(context, mutation) {
  //   const timestamp = new Date().toJSON();
  //   mutation.createdAt = timestamp;
  //   mutation.createdBy = get(context, IDENTITY_SUBJECT_PATH, SYSTEM);
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static async create(context, query, mutation) {
  //   /* NOTE: existing document in the context allows to return document without
  //            duplicate been created */
  //   const { document: existingDocument } = context;

  //   const skipCreate =
  //     !!existingDocument && existingDocument.constructor.name === this.name;

  //   if (skipCreate) {
  //     return existingDocument;
  //   }

  //   if (!mutation) {
  //     mutation = query;
  //     query    = {};
  //   }

  //   const { validator } = context;
  //   mutation = validator.normalize(mutation, this.id);

  //   this._extendWithCreatedStamps(context, mutation);

  //   if (this.beforeCreate) {
  //     await this.beforeCreate(context, query, mutation);
  //   }

  //   mutation[this.idKey] = this.createId(mutation);
  //   this._extendWithPartition(context, mutation);

  //   const isCreated = await this._create(mutation);

  //   if (!isCreated) {
  //     throw new DocumentExistsError(this, { query, mutation });
  //   }

  //   const document = new this(context, mutation);

  //   if (this.afterCreate) {
  //     await this.afterCreate(context, query, mutation, document);
  //   }

  //   return document;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static _create(attributes) {
  //   STORE[this.name] = STORE[this.name] || {};

  //   const item = STORE[this.name][attributes.id];

  //   if (!item) {
  //     STORE[this.name][attributes.id] = attributes;

  //     return true;
  //   }

  //   return false;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static async read(context, query, options) {
  //   this._extendWithPartition(context, query);

  //   const item = await this._read(query, options);

  //   if (!item) {
  //     throw new DocumentNotFoundError(this, { query, options });
  //   }

  //   const document = new this(context, item);

  //   return document;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static _read({ id = 'NONE' }) {
  //   return cloneDeep(get(STORE, `${this.name}.${id}`));
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static _extendWithUpdatedStamps(context, mutation) {
  //   const timestamp = new Date().toJSON();
  //   mutation.updatedAt = timestamp;
  //   mutation.updatedBy = get(context, IDENTITY_SUBJECT_PATH, SYSTEM);
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static async update(context, query, mutation, originalDocument = null) {
  //   mutation = omit(mutation, [ this.idKey, 'createdAt', 'createdBy' ]);

  //   this._extendWithUpdatedStamps(context, mutation);

  //   if (this.beforeUpdate) {
  //     await this.beforeUpdate(context, query, mutation);
  //   }

  //   /* NOTE: ensure that document to be updated exists and save it in the
  //            context so can be referenced in the after action helper */
  //   if (!originalDocument) {
  //     originalDocument = await this.read(context, query);
  //   }

  //   this._extendWithPartition(context, query);

  //   const updatedItem = await this._update(query, mutation);

  //   const document = new this(context, updatedItem);
  //   document._originalDocument = originalDocument;

  //   if (this.afterUpdate) {
  //     await this.afterUpdate(context, query, mutation, document);
  //   }

  //   return document;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static _update({ id }, mutation) {
  //   const item = STORE[this.name][id];

  //   /* istanbul ignore next: not used anymore by update interface as read
  //                            operation throws an error if document not found */
  //   if (!item) {
  //     return false;
  //   }

  //   STORE[this.name][id] = { ...item, ...mutation };

  //   return cloneDeep(STORE[this.name][id]);
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static async delete(context, query) {
  //   /* NOTE: ensure that document to be removed exists and save it in the
  //            context so can be referenced in the after action helper */
  //   const originalDocument = await this.read(context, query);

  //   if (this.beforeDelete) {
  //     await this.beforeDelete(context, query, originalDocument);
  //   }

  //   this._extendWithPartition(context, query);

  //   await this._delete(context, query);

  //   if (this.afterDelete) {
  //     await this.afterDelete(context, query, originalDocument);
  //   }

  //   return originalDocument;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static _delete(context, { id }) {
  //   const item = STORE[this.name][id];

  //   /* istanbul ignore next: not used anymore by delete interface as read
  //                            operation throws an error if document not found */
  //   if (!item) {
  //     return false;
  //   }

  //   delete STORE[this.name][id];

  //   return true;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static async reset() {
  //   return this._reset();
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // static _reset() {
  //   STORE[this.name] = null;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // delete() {
  //   return this.constructor.delete(this.context, this._query);
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // async update(mutation, shouldMutate = false) {
  //   const originalDocument = new this.constructor(this.context, { ...this._attributes });

  //   const document = await this.constructor.update(this.context, this._query, mutation, originalDocument);

  //   if (shouldMutate) {
  //     this._attributes = document._attributes;
  //     this._originalDocument = document._originalDocument;
  //   }

  //   return document;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // get originalDocument() {
  //   if (!this._originalDocument) {
  //     throw new Error('Original document is undefined');
  //   }

  //   return this._originalDocument;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // hasAttributeChanged(attributePath) {
  //   const { originalDocument } = this;

  //   const originalValue = get(originalDocument.attributes, attributePath);
  //   const updatedValue = get(this.attributes, attributePath);

  //   const hasChanged = originalValue !== updatedValue;

  //   return hasChanged;
  // }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // get _query() {
  //   const { idKey } = this.constructor;

  //   return {
  //     [idKey]: this._attributes[idKey]
  //   };
  // }
}

export default Document;
