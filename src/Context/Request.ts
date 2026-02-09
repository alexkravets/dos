
export type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
}

export type ExtraContext = {
  logger?: Logger;
  [index: string]: unknown;
}

export type Headers = {
  cookie?: string;
  [x: string]: unknown;
}

export type QueryMap = Record<string, unknown>;
export type MutationMap = Record<string, unknown>;

export type LambdaRequest = {
  body?: string | MutationMap;
  headers?: Headers;
  operationId: string;
  queryStringParameters?: QueryMap;
}

export type HttpRequest = {
  url: string;
  path?: string;
  body?: string;
  method?: string;
  headers: Headers;
  httpMethod?: string;
  requestContext?: {
    requestId?: string;
  };
};

export type Request = HttpRequest | LambdaRequest;
