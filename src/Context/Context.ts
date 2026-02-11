import { parse, type Cookies } from 'cookie';
import { inspect } from 'util';
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

type Runtime = Record<string, unknown>;

export type Identity = {
  sub?: string;
  name?: string;
  email?: string;
  lastName?: string;
  firstName?: string;
  [x: string]: unknown;
}

export type ContextConfig = {
  spec: OpenAPIV2.Document;
  validator: Validator,
}

const SYSTEM = 'SYSTEM';
const IDENTITY_NAME_CLAIM = 'name';
const IDENTITY_SUBJECT_CLAIM = 'sub';
const IDENTITY_LAST_NAME_CLAIM = 'lastName';
const IDENTITY_FIRST_NAME_CLAIM = 'firstName';

/** Service request context. */
class Context {
  public query: QueryMap;
  public logger: Logger;
  public headers: Headers;
  public cookies?: Cookies;
  public httpPath: string;
  public bodyJson: string | null;
  public mutation: MutationMap | null;
  public identity: Identity;
  public requestId: string;
  public validator: Validator;
  public httpMethod: string;
  public operationId: string;
  public requestReceivedAt: string;

  private _env?: string;
  private _runtime: Runtime;

  /** Creates an instance of the context. */
  constructor(config: ContextConfig, request: Request, extraContext: ExtraContext) {
    const { spec, validator } = config;

    const {
      env = process.env.NODE_APP_INSTANCE as string | undefined,
      logger = console,
      ...runtime
    } = extraContext;

    const headers = {} as Headers;
    const cookies = {} as Cookies;

    for (const headerName in request.headers) {
      headers[headerName.toLowerCase()] = request.headers[headerName];

      const isCookieHeader = headerName.toLowerCase() === 'cookie';

      if (isCookieHeader) {
        const parsedCookies = parse(headers.cookie!);

        for (const cookieName in parsedCookies) {
          cookies[cookieName.toLowerCase()] = parsedCookies[cookieName];
        }
      }
    }

    this.query = getQueryParameters(request);
    this.logger = logger;
    this.headers = headers;
    this.cookies = cookies;
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

    this._env = env;
    this._runtime = runtime;

    return withSafeAttributes<Context>(this, 'Context');
  }

  /** Returns true if running in the development environment. */
  get isDevelopment(): boolean {
    return this._env === 'dev' || !this._env;
  }

  /** Returns true if running in the test environment. */
  get isTest(): boolean {
    return this._env === 'test';
  }

  /** Returns true if running in the live, non test environment. */
  get isLive(): boolean {
    return !this.isTest;
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

  /** Returns authenticated identity ID, or SYSTEM if missing. */
  get identityId(): string {
    return get(this.identity, IDENTITY_SUBJECT_CLAIM, SYSTEM);
  }

  /** Returns authenticated identity full name if present in claims. */
  get identityName(): string | null {
    let name = get(this.identity, IDENTITY_NAME_CLAIM);

    if (name) {
      return name;
    }

    const lastName = get(this.identity, IDENTITY_LAST_NAME_CLAIM, '');
    const firstName = get(this.identity, IDENTITY_FIRST_NAME_CLAIM, '');

    name = [ firstName, lastName ]
      .map(item => item.trim())
      .join(' ');

    const isEmpty = name === ' ';

    if (!isEmpty) {
      return name;
    }

    return null;
  }

  /** Serializes context to JSON object. */
  toJSON() {
    const {
      _runtime: runtime,
      query,
      headers,
      identity,
      httpPath,
      requestId,
      httpMethod,
      operationId,
      requestReceivedAt,
      bodyJson,
      mutation,
    } = this;

    return {
      operationId,
      httpPath,
      httpMethod,
      requestId,
      requestReceivedAt,
      headers,
      query,
      mutation,
      bodyJson,
      identity,
      runtime,
    };
  }

  /** Serializes context for console.log and util.inspect. */
  [inspect.custom]() {
    return this.toJSON();
  }
};

export default Context;
