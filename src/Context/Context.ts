import getHttpPath from './getHttpPath';
import { get, set } from 'lodash';
import { got, Validator } from '@kravc/schema';
import { OpenAPIV2 } from 'openapi-types';
import getHttpMethod from './getHttpMethod';
import { randomUUID } from 'crypto';
import getOperationId from './getOperationId';
import withSafeAttributes from './withSafeAttributes';
import getQueryParameters from './getQueryParameters';
import getMutationParameters from './getMutationParameters';
import type {
  Logger,
  Headers,
  Request,
  QueryMap,
  MutationMap,
  ExtraContext
} from './Request';

export type Runtime = Record<string, unknown>;
export type Identity = Record<string, unknown>;

type Config = {
  spec: OpenAPIV2.Document;
  validator: Validator,
}

/** Service request context. */
class Context {
  public query: QueryMap;
  public logger: Logger;
  public headers: Headers;
  public httpPath: string;
  public bodyJson: string | null;
  public mutation: MutationMap | null;
  public identity: Identity;
  public requestId: string;
  public validator: Validator;
  public httpMethod: string;
  public operationId: string;
  public requestReceivedAt: string;

  private _runtime: Runtime;

  /** Creates an instance of the context. */
  constructor(config: Config, request: Request, extraContext: ExtraContext = {}) {
    const { spec, validator } = config;

    const { logger = console, ...runtime } = extraContext;

    const headers = {} as Headers;

    for (const name in request.headers) {
      headers[name.toLowerCase()] = request.headers[name];
    }

    this.query = getQueryParameters(request);
    this.logger = logger;
    this.headers = headers;
    this.identity = {};
    this.httpPath = getHttpPath(spec, request);
    this.validator = validator;
    this.requestId = get(request, 'requestContext.requestId', randomUUID());
    this.httpMethod = getHttpMethod(spec, request);
    this.operationId = getOperationId(spec, request);
    this.requestReceivedAt = new Date().toISOString();

    const { bodyJson, mutation } = getMutationParameters(request);

    this.bodyJson = bodyJson;
    this.mutation = mutation;

    this._runtime = runtime;

    return withSafeAttributes<Context>(this, 'Context');
  }

  /** Adds variable to the context runtime. */
  set(path: string, value: unknown) {
    set(this._runtime, path, value);
  }

  /** Returns variable from the context runtime. */
  get(path: string): unknown | null {
    return get(this._runtime, path, null);
  }

  /** Returns variable from the context runtime if exists, otherwise throws exception. */
  got<T>(path: string): T {
    const runtimeJson = JSON.stringify(this._runtime, null, 2);
    const errorTemplate = `Context runtime is missing "$PATH" value, runtime: ${runtimeJson}`;

    return got(this._runtime, path, errorTemplate) as T;
  }

  /** Resets context runtime. */
  runtimeReset() {
    this._runtime = {};
  }
};

export default Context;
