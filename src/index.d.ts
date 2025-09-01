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

export declare class Document<T> {
  constructor(context: Context, attributes: T);

  static get idKey(): string;
  static get sortBy(): string;
  static get idKeyPrefix(): string;
  static get documentName(): string;

  static set schema(schema: Schema);
  static get schema(): Schema;

  static get _defaultSchemaAttributes(): SchemaAttributes;

  static _read(query: QueryMap): Promise<AttributesMap>;
  static _extendWithCreatedStamps(context: Context, mutation: CreateMutationMap): void;
  static _create(attributes: AttributesMap): Promise<Boolean>;
  static _extendWithUpdatedStamps(context: Context, mutation: UpdateMutationMap): void;
  static _update(query: QueryMap, mutation: UpdateMutationMap): Promise<AttributesMap>;

  static createId(attributes: AttributesMap): string;

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

  static indexAll<T, D extends Document<T> = Document<T>>(
    this: DocumentConstructor<T, D>,
    context: Context,
    query?: QueryMap,
    options?: IndexOptions,
  ): Promise<{
    count: number;
    objects: D[];
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

export declare class JwtAuthorization {
  static createRequirement(options: {
    publicKey: string;
    name?: string;
    algorithm?: string;
    cookieName?: string;
    normalizePayload?: Function;
    tokenVerificationMethod?: Function;
    accessVerificationMethod?: (context: Context, payload: Record<string, unknown>) => [boolean, string?];
  }): Record<string, any>
};

export declare class SystemAuthorization {
  static createRequirement(options?: {
    name?: string;
    accessVerificationMethod?: (context: Context) => [boolean, string?];
  }): Record<string, any>
};

export type ComponentConstructor = new (...args: any[]) => any;
type OperationConstructor = new (...args: any[]) => any;

export declare class Operation {
  constructor(context: Context);

  public context: Context;
  static get query(): SchemaAttributes | null;
  static get mutation(): Schema | SchemaAttributes | null;
  static get output(): Schema | SchemaAttributes | null;

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

export declare class Service {
  constructor(modules: Module[], options: {
    url?: string;
    path?: string;
    skipOperations?: string[];
  });

  get spec(): ISpec;
  get baseUrl(): string;

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

export declare class CommonError extends Error {
  constructor(code: string, message: string);
  get code(): string;
  get isCommonError(): boolean;
};

export declare class UnauthorizedError extends CommonError {
  constructor(message: string);
};

export declare class AccessDeniedError extends CommonError {
  constructor(message: string);
};

export declare class InvalidParametersError extends CommonError {
  constructor(message: string)
};

export declare class UnprocessibleConditionError extends CommonError {
  constructor(message: string)
};

export declare class DocumentExistsError extends CommonError {
  constructor(Document: { name: string }, parameters: Record<string, unknown>);
};

export declare class DocumentNotFoundError extends CommonError {
  constructor(Document: { name: string }, parameters: Record<string, unknown>);
};

interface Identity {
  sub: string;
  email: string;
}

export declare function authorize(Operation, Context): Promise<Identity>;

export declare function maskSecrets(object: Record<string, unknown>): Record<string, unknown>;

export declare function getComponentTitle(Component, isCapitalized?: boolean, isPlural?: boolean): string;

export declare function getDefaultSchemaAttributes(Component): SchemaAttributes;
