import { get } from 'lodash';
import getHttpPath from './getHttpPath';
import { Validator } from '@kravc/schema';
import { OpenAPIV2 } from 'openapi-types';
import getHttpMethod from './getHttpMethod';
import { v4 as uuid } from 'uuid';
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
  public bodyJson?: string;
  public mutation?: MutationMap;
  public identity?: Identity;
  public requestId: string;
  public validator: Validator;
  public httpMethod: string;
  public operationId: string;
  public requestReceivedAt: string;

  /** Creates an instance of the context. */
  constructor(config: Config, request: Request, extraContext: ExtraContext = {}) {
    const { spec, validator } = config;

    const { logger = console } = extraContext;

    const headers = {} as Headers;

    for (const name in request.headers) {
      headers[name.toLowerCase()] = request.headers[name];
    }

    this.query = getQueryParameters(request);
    this.logger = logger;
    this.headers = headers;
    this.httpPath = getHttpPath(spec, request);
    this.validator = validator;
    this.requestId = get(request, 'requestContext.requestId', uuid());
    this.httpMethod = getHttpMethod(spec, request);
    this.operationId = getOperationId(spec, request);
    this.requestReceivedAt = new Date().toISOString();

    const { bodyJson, mutation } = getMutationParameters(request);

    this.bodyJson = bodyJson;
    this.mutation = mutation;

    return withSafeAttributes<Context>(this);
  }
};

export default Context;
