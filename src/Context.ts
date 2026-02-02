import { Validator } from '@kravc/schema';

export type QueryMap = Record<string, unknown>;
export type MutationMap = Record<string, unknown>;

export type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
}

export type Headers = Record<string, unknown>;

export type Identity = Record<string, unknown>;

export type Context = {
  query: QueryMap;
  logger: Logger;
  headers: Headers;
  httpPath: string;
  bodyJson?: string;
  mutation?: MutationMap;
  identity?: Identity;
  requestId: string;
  validator: Validator;
  httpMethod: string;
  operationId: string;
  requestReceivedAt: string;
  // [index: string]: unknown;
}

export type Request = {
  headers: Headers;
  url?: string;
  path?: string;
  body?: string | MutationMap;
  method?: string;
  httpMethod?: string;
  operationId?: string;
  requestContext?: {
    requestId?: string;
  };
  queryStringParameters?: QueryMap;
}
