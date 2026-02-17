import { ulid } from 'ulid';
import Component from '../Component';
import { Schema, type PropertiesSchemaSource, got } from '@kravc/schema';
import Context, { type QueryMap, type MutationMap } from '../Context';
import { get, set, omit, pick, cloneDeep, capitalize } from 'lodash';

const DEFAULT_INDEX_SORT = 'desc';
const DEFAULT_INDEX_LIMIT = 20;
const DEFAULT_INDEX_LIMIT_MAX = 100;

const DEFAULT_PARTITION_KEY = 'partition';

export type IndexOptions = {
  sort?: 'asc' | 'desc';
  limit?: number;
  indexName?: string;
  exclusiveStartKey?: string;
}

export type IndexAllOptions = {
  sort?: 'asc' | 'desc';
  indexName?: string;
}

export type DefaultAttributes = {
  id: string;
  partition: string;
  createdAt: string;
  createdBy: string;
  createdByUserName?: string;
  updatedAt?: string;
  updatedBy?: string;
  updatedByUserName?: string;
};

type Constructor<T, D extends Document<T> = Document<T>> = {
  new(context: Context, attributes: T): D;

  _index(query: QueryMap, options: IndexOptions): Promise<{
    limit: number;
    count: number;
    items: T[];
    lastEvaluatedKey?: string;
  }>;

  _indexAll(query: QueryMap, options: IndexAllOptions): Promise<{
    count: number;
    items: T[];
  }>;

  _read(query: QueryMap, options: unknown): Promise<T>;

  _create(attributes: T, context?: Context): Promise<void>;

  _update<T>(query: QueryMap, mutation: MutationMap, context?: Context): Promise<T>;

  _delete(query: QueryMap, context?: Context): Promise<void>;
};

/** Abstract document class. */
class Document<Attributes> extends Component<Attributes> {
  private static _bodySchema: Schema;

  private _previousAttributes: Attributes | undefined;

  /** Returns partition key of a document. */
  static get partitionKey(): string {
    return DEFAULT_PARTITION_KEY;
  }

  /** Returns prefix for new IDs. */
  static get idPrefix(): string {
    return this.name;
  }

  /** Returns attribute name to sort index action results by. */
  static get indexSortBy(): string {
    return this.idKey;
  }

  /** Defines default sort direction for index action results. */
  static get indexDefaultSort(): 'asc' | 'desc' {
    return DEFAULT_INDEX_SORT;
  }

  /** Defines default limit for index action. */
  static get indexDefaultLimit(): number {
    return DEFAULT_INDEX_LIMIT;
  }

  /** Defines limit maximum value for index action. */
  static get indexLimitMax(): number {
    return DEFAULT_INDEX_LIMIT_MAX;
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
        description: `ID of a user who created ${documentTitle}`,
        required: true
      },
      createdByUserName: {
        description: `Name of a user who created ${documentTitle}`
      },
      updatedAt: {
        description: `Date and time when ${documentTitle} was updated`,
        format: 'date-time'
      },
      updatedBy: {
        description: `ID of a user who updated ${documentTitle}`
      },
      updatedByUserName: {
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
      throw new Error(`Schema is not set for "${this.id}"`);
    }

    return this._schema;
  }

  /** Returns body schema of a document. */
  static get bodySchema() {
    return this._bodySchema;
  }

  /** Returns schema for document create and update mutations. */
  static get mutationSchema(): Schema {
    return this.bodySchema;
  }

  /** Returns partition to save document based on context and parameters. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getPartition(_context: Context, _parameters: Record<string, unknown>): string | undefined {
    return undefined;
  }

  /** Extends parameters with partition of a document. */
  static _extendWithPartition(context: Context, parameters: Record<string, unknown>): void {
    const hasPartition = !!get(parameters, this.partitionKey);

    if (hasPartition) {
      return;
    }

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
    mutation.createdBy = context.identityId;
    mutation.createdByUserName = context.identityName;
  }

  /** Extends mutation with updated stamps. */
  static _extendWithUpdatedStamps(context: Context, mutation: MutationMap) {
    const timestamp = new Date().toJSON();

    mutation.updatedAt = timestamp;
    mutation.updatedBy = context.identityId;
    mutation.updatedByUserName = context.identityName;
  }

  /** Extends mutation with deleted stamps. */
  static _extendWithDeletedStamps(context: Context, mutation: MutationMap) {
    const timestamp = new Date().toJSON();

    mutation.deletedAt = timestamp;
    mutation.deletedBy = context.identityId;
    mutation.deletedByUserName = context.identityName;
  }

  /** Returns documents in batches. */
  static async index<T, D extends Document<T> = Document<T>>(
    this: Constructor<T, D>,
    context: Context,
    query: QueryMap = {},
    options: IndexOptions = {}
  ): Promise<{
    limit: number;
    count: number;
    objects: D[];
    lastEvaluatedKey?: string;
  }> {
    const _this = this as unknown as typeof Document;
    _this._extendWithPartition(context, query);

    if (!options.limit) {
      options.limit = _this.indexDefaultLimit;
    }

    if (!options.sort) {
      options.sort = _this.indexDefaultSort;
    }

    const { count, limit, items, lastEvaluatedKey } = await this._index(query, options);
    const objects = items.map(attributes => new this(context, attributes));

    return {
      limit,
      count,
      objects,
      lastEvaluatedKey,
    };
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

    if (!options.sort) {
      options.sort = _this.indexDefaultSort;
    }

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
    const createdDocument = context.get('createdDocument') as D;
    const shouldNotCreate = createdDocument?.componentId === this.name;

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

    /* NOTE: In some workflows operation before action helper may be doing
             some verifications with the document to be updated. Here we
             allow to cache it in the context. */
    const idValue = got(query, _this.idKey, 'Query parameter "$PATH" is required') as string;

    const previousDocument = context.get(idValue) as D;
    let previousAttributes = previousDocument?.attributes;

    /* NOTE: Ensure that document to be updated exists and save it in the
             context so can be referenced in the after action helper. */
    if (!previousAttributes) {
      previousAttributes = await this._read(query, {});
    }

    const updatedAttributes = await this._update(query, mutation) as T;
    const object = new this(context, updatedAttributes);

    object._previousAttributes = previousAttributes;

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

    await this._delete(query, context);

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

  /** Returns document ID. */
  get id(): string {
    const klass = this.constructor as unknown as typeof Document;
    return got(this.attributes as Record<string, string>, klass.idKey);
  }

  /** Returns previous attributes after update action. */
  get previousAttributes() {
    return this._previousAttributes || null;
  }

  /** Flags if document attribute has been changed via update action. */
  hasAttributeChanged(path: string): boolean {
    if (!this.previousAttributes) {
      throw Error(`${this.componentId} ${this.id} has not been updated`);
    }

    const currentValue = get(this.attributes, path);
    const previousValue = get(this.previousAttributes, path);

    const hasChanged = previousValue !== currentValue;

    return hasChanged;
  }

  /** Updates document attributes. */
  async update(mutation: MutationMap): Promise<void> {
    const klass = this.constructor as unknown as Constructor<Attributes, Document<Attributes>> & typeof Document;

    this.context.set(this.id, this);

    const query = pick(this.attributes, [ klass.idKey, klass.partitionKey ]);
    const object = await klass.update(this.context, query, mutation);

    this._previousAttributes = cloneDeep(this.attributes) as Attributes;

    set(this, '_attributes', object.attributes);
  }
}

export default Document;
