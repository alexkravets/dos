import Component from '../Component';
import Operation from '../Operation';
import stringify from 'safe-stable-stringify';
import { OpenAPIV2 } from 'openapi-types';
import { createSpec } from './spec';
import { get, uniq, keyBy, compact } from 'lodash';
import Context, { type ContextConfig, type Request, type ExtraContext } from '../Context';
import { got, Schema, Validator, type ValidationError } from '@kravc/schema';

import {
  type OriginalError,
  OperationError,
  InvalidInputError,
  InvalidOutputError,
  OperationNotFoundError,
} from './errors';

import authorize from './authorize';
import logRequest from './logRequest';
import useOasMiddleware from './useOasMiddleware';
import useComposerMiddleware from './useComposerMiddleware';

const DEFAULT_URL = 'http://localhost:3000/';
const DEFAULT_SKIP_OPERATIONS = [] as string[];

/** Creates operation context using default Context class. */
const createDefaultContext = (
  config: ContextConfig,
  request: Request,
  extraContext: ExtraContext
) => new Context(config, request, extraContext);

type Module = {
  id: string;
};

type Options = {
  url?: string;
  context?: ExtraContext,
  createContext?: typeof createDefaultContext;
  skipOperations?: string[];
};

/** Returns true if TargetClass is a constructor whose prototype extends BaseClass. */
function isExtendedFrom(
  TargetClass: unknown,
  BaseClass: typeof Operation | typeof Component
): boolean {
  return (
    typeof TargetClass === 'function' &&
    (TargetClass as abstract new (...args: unknown[]) => unknown).prototype instanceof BaseClass
  );
}

/** Service */
class Service {
  private _url: string;
  private _spec: OpenAPIV2.Document;
  private _validator: Validator;
  private _createContext: typeof createDefaultContext;
  private _operationsMap: Record<string, typeof Operation>;
  private _serviceContext: ExtraContext;

  /** Creates service instance. */
  constructor(modules: Module[], options: Options = {}) {
    let { url = DEFAULT_URL } = options;

    const shouldNormalizeUrl = !url.endsWith('/');

    if (shouldNormalizeUrl) {
      url = url + '/';
    }

    const {
      context = {},
      createContext = createDefaultContext,
      skipOperations = DEFAULT_SKIP_OPERATIONS,
    } = options;

    const schemas = modules
      .filter(m => m instanceof Schema) as Schema[];

    const nonSchemas = modules
      .filter(m => !(m instanceof Schema));

    let components = nonSchemas
      .filter(m => isExtendedFrom(m, Component)) as (typeof Component)[];

    const operations = nonSchemas
      .filter(m => isExtendedFrom(m, Operation))
      .filter(({ id: operationId }) => !skipOperations.includes(operationId)) as (typeof Operation)[];

    const referencedComponents = compact(operations.map(({ Component }) => Component));

    components = uniq([
      ...components,
      ...referencedComponents
    ]);

    const schemasMap = keyBy(schemas, 'id') as Record<string, Schema>;

    schemasMap[OperationError.id] = OperationError.schema;

    for (const ComponentClass of components) {
      if (!ComponentClass.hasSchema) {
        const schema = schemasMap[ComponentClass.id];

        if (!schema) {
          throw new Error(`Schema for component "${ComponentClass.id}" is not found`);
        }

        ComponentClass.schema = schema;
      }

      schemasMap[ComponentClass.id] = ComponentClass.schema!;
    }

    const operationsMap = {} as Record<string, typeof Operation>;

    for (const OperationClass of operations) {
      const {
        inputSchema,
        outputSchema,
        mutationSchema,
      } = OperationClass;

      if (inputSchema) {
        schemasMap[inputSchema.id] = inputSchema;
      }

      if (outputSchema) {
        schemasMap[outputSchema.id] = outputSchema;
      }

      if (mutationSchema) {
        schemasMap[mutationSchema.id] = mutationSchema;
      }

      operationsMap[OperationClass.id] = OperationClass;
    }

    const spec = createSpec(operations, schemasMap, url);
    const validator = new Validator(Object.values(schemasMap));

    this._url = url;
    this._spec = spec;
    this._validator = validator;
    this._createContext = createContext;
    this._operationsMap = operationsMap;
    this._serviceContext = context;
  }

  /** Returns service base URL. */
  get baseUrl() {
    return this._url;
  }

  /** Returns service validator. */
  get validator() {
    return this._validator;
  }

  /** Returns service specification. */
  get spec() {
    return this._spec;
  }

  /** Returns operation class by operation ID. */
  get(operationId: string) {
    const errorTemplate = 'Operation "$PATH" is not found';
    return got(this._operationsMap, operationId, errorTemplate) as typeof Operation;
  }

  /** Processes incoming request. */
  async process(request: Request, extraContext: ExtraContext = {}) {
    let context: Context;

    try {
      context = this._createContext(this, request, {
        ...this._serviceContext,
        ...extraContext
      });

    } catch (error) {
      const logger = get({ ...this._serviceContext, ...extraContext }, 'logger', console);

      const requestJson = stringify(request, undefined, 2);
      logger.error(`Failed to create context for request: ${requestJson}`);

      throw error;
    }

    const result =
      useOasMiddleware(this, context) ||
      useComposerMiddleware(this, context);

    if (result) {
      return result;
    }

    logRequest(context);

    const { operationId } = context;
    const OperationClass = this._operationsMap[operationId];

    let output: Record<string, undefined>;
    let headers = {};
    let statusCode: number;
    let multiValueHeaders = {};

    try {
      const { httpMethod, httpPath } = context;

      if (!OperationClass) {
        throw new OperationNotFoundError({ operationId, httpMethod, httpPath });
      }

      const {
        isUpdate,
        security,
        inputSchema,
        outputSchema
      } = OperationClass;

      context.identity = await authorize(context, security);

      const parameters = this._getParameters(inputSchema, context, isUpdate);

      const operation = new OperationClass(context);
      const response = await operation.exec(parameters);

      output = this._getOutput(outputSchema, response.result);
      headers = response.headers;
      statusCode = this._getStatusCode(OperationClass);
      multiValueHeaders = response.multiValueHeaders;

    } catch (error) {
      /*
       * An error an operation does not declare is a spec/implementation
       * mismatch, so it is reported as an unexpected error rather than with a
       * code the published contract never advertised.
       */
      const errorCode = get(error, 'code') as string | undefined;

      const isDeclaredError = OperationClass
        ? OperationClass.hasError(errorCode)
        : true;

      const errorStatusCode = OperationClass && isDeclaredError
        ? OperationClass.getErrorStatusCode(error as OriginalError)
        : get(error, 'statusCode', 500);

      const operationError = new OperationError(
        context,
        errorStatusCode,
        error as OriginalError,
        isDeclaredError
      );

      output = operationError.validate();
      statusCode = errorStatusCode;
    }

    if (!output) {
      return {
        headers,
        statusCode,
        multiValueHeaders
      };
    }

    const body = JSON.stringify(output, null, 2);

    return {
      body,
      headers,
      statusCode,
      multiValueHeaders,
    };
  }

  /** Validates operation input and returns normalized parameters. */
  _getParameters(inputSchema: Schema | null, context: Context, shouldNullifyEmptyValues: boolean) {
    if (!inputSchema) {
      return {};
    }

    const { query, mutation } = context;

    const input = {
      ...query,
      mutation
    };

    let result;

    try {
      result = this._validator.validate(input, inputSchema.id, shouldNullifyEmptyValues);

    } catch (validationError) {
      throw new InvalidInputError(validationError as ValidationError);

    }

    return result;
  }

  /** Returns validated and normalized output object. */
  _getOutput(outputSchema: Schema | null, object: Record<string, unknown>) {
    if (!outputSchema) {
      return null;
    }

    let output;

    const shouldNullifyEmptyValues = false;
    const shouldCleanupNulls = true;

    try {
      output = this._validator.validate(object, outputSchema.id, shouldNullifyEmptyValues, shouldCleanupNulls);

    } catch (validationError) {
      throw new InvalidOutputError(validationError as ValidationError);

    }

    return output;
  }

  /** Returns status code for the operation. */
  _getStatusCode(OperationClass: typeof Operation) {
    if (!OperationClass.hasOutput) {
      return 204;
    }

    if (OperationClass.isCreate) {
      return 201;
    }

    return 200;
  }
}

export default Service;
