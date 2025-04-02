
export declare type SortOrder = 'asc' | 'desc';
export declare type Context = Record<string, any>;
export declare type QueryMap = Record<string, any>;
export declare type CreateMutationMap = Record<string, any>;
export declare type UpdateMutationMap = Record<string, any>;

export declare interface IndexOptions {
  sort?: SortOrder;
  limit?: number;
  index?: string;
  exclusiveStartKey?: string;
}

export declare interface IndexAllOptions {
  sort?: SortOrder;
  index?: string;
}

export declare type DocumentConstructor<T, D extends Document<T> = Document<T>> = {
  new(context: Context, attributes: T): D;
};

export declare class Document<T> {
  constructor(context: Context, attributes: T);

  static get idKey(): string;
  static get sortBy(): string;
  static get idKeyPrefix(): string;
  static get documentName(): string;

  static getPartition(
    context: Context,
    parameters: Record<string, any>
  ): string;

  static index<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query?: QueryMap,
    options?: IndexOptions,
  ): Promise<{
    count: number;
    objects: D[];
    lastEvaluatedKey: string;
  }>;

  static read<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query: QueryMap,
  ): Promise<D>;

  static create<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query: QueryMap | CreateMutationMap,
    mutation?: CreateMutationMap
  ): Promise<D>;

  static update<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query: QueryMap,
    mutation: UpdateMutationMap,
    originalDocument?: D
  ): Promise<D>;

  static delete(
    context: Context,
    query: QueryMap
  ): Promise<void>;

  static beforeCreate(
    context: Context,
    query: QueryMap,
    mutation: CreateMutationMap
  ): Promise<void>;

  static afterCreate<T, D extends Document<T> = Document<T>>(
    context: Context,
    query: QueryMap,
    mutation: CreateMutationMap,
    originalDocument: D
  ): Promise<void>;

  static beforeUpdate(
    context: Context,
    query: QueryMap,
    mutation: UpdateMutationMap,
  ): Promise<void>;

  static afterUpdate<T, D extends Document<T> = Document<T>>(
    context: Context,
    query: QueryMap,
    mutation: UpdateMutationMap,
    originalDocument: D
  ): Promise<void>;

  static beforeDelete(
    context: Context,
    query: QueryMap,
  ): Promise<void>;

  static afterDelete<T, D extends Document<T> = Document<T>>(
    context: Context,
    query: QueryMap,
    originalDocument: D
  ): Promise<void>;

  get id(): string;
  get context(): Context;
  get attributes(): T;
  get componentId(): string;
  get originalDocument(): this;
  get _query(): Record<string, any>;

  _attributes: Record<string, any>;

  update(mutation: UpdateMutationMap, shouldMutate?: boolean): Promise<this>;
  delete(): Promise<void>;
  hasAttributeChanged(attributePath: string): boolean;
  toJSON(): Record<string, any>;
}

export declare function getOrFail(
  object: Record<string, any>,
  path: string
): any;

export declare function verifyToken(
  context: Context,
  token: string,
  publicKey: string,
  algorithm: string,
): Promise<[ boolean, string | undefined ]>;
