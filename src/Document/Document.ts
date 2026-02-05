import { ulid } from 'ulid';
import Component from '../Component';
import { get, set, omit, capitalize } from 'lodash';
import { Schema, type PropertiesSchemaSource } from '@kravc/schema';
import Context, { type QueryMap, type MutationMap } from '../Context';

const DEFAULT_PARTITION_KEY = 'partition';

const SYSTEM = 'SYSTEM';
const IDENTITY_SUBJECT_PATH = 'identity.sub';

type Constructor<T, D extends Document<T> = Document<T>> = {
  new(context: Context, attributes: T): D;

  _index(query: QueryMap, options: IndexOptions): Promise<{
    count: number;
    items: T[];
    lastEvaluatedKey?: string;
  }>;

  _indexAll(query: QueryMap, options: IndexAllOptions): Promise<{
    count: number;
    items: T[];
  }>;

  _read(query: QueryMap, options: unknown): Promise<T>;

  _create(attributes: T): Promise<void>;

  _update<T>(query: QueryMap, mutation: MutationMap): Promise<T>;

  _delete(query: QueryMap): Promise<void>;
};

export type IndexOptions = {
  sort?: 'asc' | 'desc';
  limit?: number;
  index?: string;
  exclusiveStartKey?: string;
}

export type IndexAllOptions = {
  sort?: 'asc' | 'desc';
  index?: string;
}

/** Abstract document class. */
class Document<Attributes> extends Component<Attributes> {
  private static _bodySchema: Schema;

  /** Returns partition key of a document. */
  static get partitionKey(): string {
    return DEFAULT_PARTITION_KEY;
  }

  /** Returns prefix for new IDs. */
  static get idPrefix(): string {
    return this.name;
  }

  /** Generates ID for new document unless it's defined in parameters. */
  static createId(attributes: Record<string, unknown>): string {
    const id = get(attributes, this.idKey) as string;
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

  /** Returns schema to validate document attributes. */
  static get schema(): Schema {
    if (!this._schema) {
      throw new Error(`Schema is not set for ${this.name}`);
    }

    return this._schema;
  }

  /** Returns body schema to validate attributes for the update method. */
  static get bodySchema() {
    return this._bodySchema;
  }

  /** Returns partition to save document based on context and parameters. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getPartition(_context: Context, _parameters: Record<string, unknown>): string | undefined {
    return undefined;
  }

  /** Extends parameters with partition of a document. */
  static _extendWithPartition(context: Context, parameters: Record<string, unknown>): void {
    const partition = this.getPartition(context, parameters);

    if (!partition) {
      return;
    }

    set(parameters, this.partitionKey, partition);
  }

  /** Extends mutation with created stamps. */
  static _extendWithCreatedStamps(context: Context, mutation: MutationMap) {
    const timestamp = new Date().toJSON();

    mutation.createdAt = timestamp;
    mutation.createdBy = get(context, IDENTITY_SUBJECT_PATH, SYSTEM);
    mutation.createdByUserFullname = 'USER_FULL_NAME';
  }

  /** Extends mutation with updated stamps. */
  static _extendWithUpdatedStamps(context: Context, mutation: MutationMap) {
    const timestamp = new Date().toJSON();

    mutation.updatedAt = timestamp;
    mutation.updatedBy = get(context, IDENTITY_SUBJECT_PATH, SYSTEM);
    mutation.updatedByUserFullname = 'USER_FULL_NAME';
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
    const _this = this as unknown as typeof Document;
    _this._extendWithPartition(context, query);

    const { items, count, lastEvaluatedKey, ...otherPagination } = await this._index(query, options);
    const objects = items.map(attributes => new this(context, attributes));

    return { objects, count, lastEvaluatedKey, ...otherPagination };
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
    const _this = this as unknown as typeof Document;
    _this._extendWithPartition(context, query);

    const { items, count } = await this._indexAll(query, options);
    const objects = items.map(attributes => new this(context, attributes));

    return { objects, count };
  }

  /** Returns a document by ID attribute. */
  static async read<T, D extends Document<T> = Document<T>>(
    this: Constructor<T, D>,
    context: Context,
    query: QueryMap,
    options?: unknown
  ): Promise<D> {
    const _this = this as unknown as typeof Document;
    _this._extendWithPartition(context, query);

    const attributes = await this._read(query, options);
    const object = new this(context, attributes);

    return object;
  }

  /** Creates a document. */
  static async create<T, D extends Document<T> = Document<T>>(
    this: Constructor<T, D>,
    context: Context,
    query: QueryMap | MutationMap,
    mutation?: MutationMap
  ): Promise<D> {
    const _this = this as unknown as typeof Document;

    // NOTE: This allows implementing the create-unless-exists flow, which first
    //       checks existence of the document via before hooks. If it does
    //       exist, they add it to the context. Then the operation's action
    //       method would do nothing and just return the document from the context.
    const createdDocument = get(context, 'createdDocument') as unknown as D;
    const shouldNotCreate = !!createdDocument && createdDocument.constructor.name === this.name;

    if (shouldNotCreate) {
      return createdDocument;
    }

    if (!mutation) {
      mutation = query;
      query = {};
    }

    const { validator } = context;
    const attributes = validator.normalize(mutation, _this.id) as MutationMap;

    const idValue = _this.createId(attributes);
    set(attributes, _this.idKey, idValue);

    _this._extendWithCreatedStamps(context, attributes);
    _this._extendWithPartition(context, attributes);

    await _this.beforeCreate(context, query, attributes);

    await this._create(attributes as T);
    const object = new this(context, attributes as T);

    await _this.afterCreate(context, query, mutation, object);

    return object;
  }

  /** Before create hook. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async beforeCreate(_context: Context, _query: QueryMap, _mutation: MutationMap): Promise<void> {
    return;
  }

  /** After create hook. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async afterCreate(_context: Context, _query: QueryMap, _mutation: MutationMap, _createdDocument: unknown): Promise<void> {
    return;
  }

  /** Updates a document. */
  static async update<T, D extends Document<T> = Document<T>>(
    this: Constructor<T, D>,
    context: Context,
    query: QueryMap,
    mutation: MutationMap
  ): Promise<D> {
    const _this = this as unknown as typeof Document;

    mutation = omit(mutation, Object.keys(_this.defaultAttributesSchemaSource));

    _this._extendWithUpdatedStamps(context, mutation);
    _this._extendWithPartition(context, query);

    await _this.beforeUpdate(context, query, mutation);

    /* NOTE: ensure that document to be updated exists and save it in the
             context so can be referenced in the after action helper */
    // if (!originalDocument) {
    //   originalDocument = await _this.read(context, query);
    // }

    const updatedAttributes = await this._update(query, mutation) as T;
    const object = new this(context, updatedAttributes);

    // document._originalDocument = originalDocument;

    await _this.afterUpdate(context, query, mutation, object);

    return object;
  }

  /** Before update hook. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async beforeUpdate(_context: Context, _query: QueryMap, _mutation: MutationMap): Promise<void> {
    return;
  }

  /** After update hook. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async afterUpdate(_context: Context, _query: QueryMap, _mutation: MutationMap, _updatedDocument: unknown): Promise<void> {
    return;
  }

  /** Deletes a document. */
  static async delete<T, D extends Document<T> = Document<T>>(
    this: Constructor<T, D>,
    context: Context,
    query: QueryMap,
  ): Promise<D> {
    const _this = this as unknown as typeof Document;

    _this._extendWithPartition(context, query);

    await _this.beforeDelete(context, query);

    const attributes = await this._read(query, {});
    const object = new this(context, attributes);

    await this._delete(query);

    await _this.afterDelete(context, query, object);

    return object;
  }

  /** Before delete hook. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async beforeDelete(_context: Context, _query: QueryMap): Promise<void> {
    return;
  }

  /** After delete hook. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async afterDelete(_context: Context, _query: QueryMap, _deletedDocument: unknown): Promise<void> {
    return;
  }

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // get _query() {
  //   const { idKey } = this.constructor;

  //   return {
  //     [idKey]: this._attributes[idKey]
  //   };
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
}

export default Document;
