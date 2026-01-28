import type { Schema, SchemaAttributes } from '@kravc/schema';

export declare type SortOrder = 'asc' | 'desc';
export declare type Context = Record<string, any>;
export declare type QueryMap = Record<string, any>;
export declare type CreateMutationMap = Record<string, any>;
export declare type UpdateMutationMap = Record<string, any>;
export declare type AttributesMap = Record<string, any>;
export declare type OperationParameters = Record<string, unknown>;
export declare type Headers = Record<string, string>;

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

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class Document<T> {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(context: Context, attributes: T);

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get idKey(): string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get sortBy(): string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get idKeyPrefix(): string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get documentName(): string;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static set schema(schema: Schema);
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get schema(): Schema;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get _defaultSchemaAttributes(): SchemaAttributes;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static _read(query: QueryMap): Promise<AttributesMap>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static _extendWithCreatedStamps(context: Context, mutation: CreateMutationMap): void;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static _create(attributes: AttributesMap): Promise<boolean>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static _extendWithUpdatedStamps(context: Context, mutation: UpdateMutationMap): void;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static _update(query: QueryMap, mutation: UpdateMutationMap): Promise<AttributesMap>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static createId(attributes: AttributesMap): string;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static getPartition(
    context: Context,
    parameters: Record<string, any>
  ): string;

  // eslint-disable-next-line jsdoc/require-jsdoc
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

  // eslint-disable-next-line jsdoc/require-jsdoc
  static indexAll<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query?: QueryMap,
    options?: IndexOptions,
  ): Promise<{
    count: number;
    objects: D[];
  }>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static read<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query: QueryMap,
  ): Promise<D>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static create<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query: QueryMap | CreateMutationMap,
    mutation?: CreateMutationMap
  ): Promise<D>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static update<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query: QueryMap,
    mutation: UpdateMutationMap,
    originalDocument?: D
  ): Promise<D>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static delete(
    context: Context,
    query: QueryMap
  ): Promise<void>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static beforeCreate(
    context: Context,
    query: QueryMap,
    mutation: CreateMutationMap
  ): Promise<void>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  static beforeUpdate(
    context: Context,
    query: QueryMap,
    mutation: UpdateMutationMap,
  ): Promise<void>;

  // static beforeDelete<T, D extends Document<T> = Document<T>>(
  //   context: Context,
  //   query: QueryMap,
  //   originalDocument: D
  // ): Promise<void>;

  // static afterCreate<T, D extends Document<T> = Document<T>>(
  //   context: Context,
  //   query: QueryMap,
  //   mutation: CreateMutationMap,
  //   originalDocument: D
  // ): Promise<void>;

  // static afterUpdate<T, D extends Document<T> = Document<T>>(
  //   context: Context,
  //   query: QueryMap,
  //   mutation: UpdateMutationMap,
  //   originalDocument: D
  // ): Promise<void>;

  // static afterDelete<T, D extends Document<T> = Document<T>>(
  //   context: Context,
  //   query: QueryMap,
  //   originalDocument: D
  // ): Promise<void>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  get id(): string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  get context(): Context;
  // eslint-disable-next-line jsdoc/require-jsdoc
  get attributes(): T;
  // eslint-disable-next-line jsdoc/require-jsdoc
  get componentId(): string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  get originalDocument(): this;
  // eslint-disable-next-line jsdoc/require-jsdoc
  get _query(): Record<string, any>;

  _attributes: Record<string, any>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  update(mutation: UpdateMutationMap, shouldMutate?: boolean): Promise<this>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  delete(): Promise<void>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  hasAttributeChanged(attributePath: string): boolean;
  // eslint-disable-next-line jsdoc/require-jsdoc
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

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class JwtAuthorization {
  // eslint-disable-next-line jsdoc/require-jsdoc
  static createRequirement(options: {
    publicKey: string;
    name?: string;
    algorithm?: string;
    cookieName?: string;
    description?: string;
    requirementName?: string;
    normalizePayload?: Function;
    tokenVerificationMethod?: Function;
    accessVerificationMethod?: (context: Context, payload: Record<string, unknown>) => [boolean, string?];
  }): Record<string, any>
}

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class SystemAuthorization {
  // eslint-disable-next-line jsdoc/require-jsdoc
  static createRequirement(options?: {
    name?: string;
    description?: string;
    requirementName?: string;
    accessVerificationMethod?: (context: Context) => [boolean, string?];
  }): Record<string, any>
}

export type ComponentConstructor = new (...args: any[]) => any;
type OperationConstructor = new (...args: any[]) => any;

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class Operation {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(context: Context);

  public context: Context;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get query(): SchemaAttributes | null;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get mutation(): Schema | SchemaAttributes | null;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static get output(): Schema | SchemaAttributes | null;

  // eslint-disable-next-line jsdoc/require-jsdoc
  exec(parameters: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export declare function Read(
  Component: ComponentConstructor,
  componentAction?: string
): typeof Operation;

export declare function Create(
  Component: ComponentConstructor,
  componentAction?: string
): typeof Operation;

export declare function Update(
  Component: ComponentConstructor,
  componentAction?: string
): typeof Operation;

export declare function Delete(
  Component: ComponentConstructor,
  componentAction?: string
): typeof Operation;

export declare function Index(
  Component: ComponentConstructor,
  componentAction?: string
): typeof Operation;

declare type Module = Operation | Schema | ComponentConstructor;

interface ISpec {
  paths: Record<string, unknown>;
}

interface HttpRequest {
  url: string;
  path?: string;
  body?: string | Record<string, unknown>;
  method: string;
  headers?: Headers;
  requestContext?: {
    requestId?: string;
  };
}

interface SystemRequest {
  body?: string | Record<string, unknown>;
  headers?: Headers;
  operationId: string;
  queryStringParameters?: Record<string, unknown>;
  requestContext?: {
    requestId?: string;
  };
}

type IRequest = HttpRequest | SystemRequest;

interface IResponse {
  body?: string,
  headers: Headers,
  statusCode: number,
}

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class Service {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(modules: Module[], options: {
    url?: string;
    path?: string;
    skipOperations?: string[];
  });

  // eslint-disable-next-line jsdoc/require-jsdoc
  get spec(): ISpec;
  // eslint-disable-next-line jsdoc/require-jsdoc
  get baseUrl(): string;

  // eslint-disable-next-line jsdoc/require-jsdoc
  handler(request: IRequest, Context): Promise<IResponse>;
}

export declare function createAccessToken(
  options: Record<string, string>,
  payload: Record<string, unknown>
): string;

export declare function wait(ms: number): Promise<void>;

export type Data = Record<string, unknown>[] | Record<string, unknown>;

export type OperationError = {
  code: string;
  message: string;
  statusCode: string;
};

interface ExecutionResult {
  error?: OperationError,
  data?: Data,
}

export declare function execute(service: Service, extraContext?: Record<string, unknown>):
  {
    request: (
      operationId: string,
      parameters: OperationParameters,
      headers: Headers
    ) => Promise<Data>;
    expectError: (
      operationId: string,
      parameters: OperationParameters,
      headers: Headers,
      errorName: string
    ) => Promise<OperationError>;
  }

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class CommonError extends Error {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(code: string, message: string);
  // eslint-disable-next-line jsdoc/require-jsdoc
  get code(): string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  get isCommonError(): boolean;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class UnauthorizedError extends CommonError {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(message: string);
}

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class AccessDeniedError extends CommonError {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(message: string);
}

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class InvalidParametersError extends CommonError {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(message: string)
}

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class UnprocessibleConditionError extends CommonError {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(message: string)
}

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class DocumentExistsError extends CommonError {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(Document: { name: string }, parameters: Record<string, unknown>);
}

// eslint-disable-next-line jsdoc/require-jsdoc
export declare class DocumentNotFoundError extends CommonError {
  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(Document: { name: string }, parameters: Record<string, unknown>);
}

interface Identity {
  sub: string;
  email: string;
}

export declare function authorize(Operation, Context): Promise<Identity>;

export declare function maskSecrets(object: Record<string, unknown>): Record<string, unknown>;

export declare function getComponentTitle(Component, isCapitalized?: boolean, isPlural?: boolean): string;

export declare function getDefaultSchemaAttributes(Component): SchemaAttributes;
