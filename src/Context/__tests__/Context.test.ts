import { get } from 'lodash';
import { Context } from '../';
import { OpenAPIV2 } from 'openapi-types';
import { randomUUID } from 'crypto';
import { Schema, Validator } from '@kravc/schema';
import type { LambdaRequest, HttpRequest } from '../Request';

describe('Context', () => {
  describe('constructor(config, request, extraContext)', () => {
    const schema = new Schema({ id: { required: true } });
    const validator = new Validator([ schema ]);
    const operationId = 'TestOperationId';

    const spec = {
      basePath: '/api',
      paths: {
        [`/${operationId}`]: {
          get: {
            operationId,
          },
        }
      }
    } as unknown as OpenAPIV2.Document;

    it('should create instance for lambda request', () => {
      const lambdaRequest = {
        headers: {},
        operationId,
      } as LambdaRequest;

      const context = new Context({ spec, validator }, lambdaRequest);

      expect(context.query).toEqual({});
      expect(context.logger).toBe(console);
      expect(context.headers).toEqual({});
      expect(context.httpPath).toEqual(`/${operationId}`);
      expect(context.bodyJson).toBeNull();
      expect(context.mutation).toBeNull();
      expect(context.identity).toEqual({});
      expect(context.requestId).toBeDefined();
      expect(context.validator).toBe(validator);
      expect(context.httpMethod).toEqual('get');
      expect(context.operationId).toBe(operationId);
      expect(context.requestReceivedAt).toBeDefined();

      expect(() => get(context, 'undefinedAttribute'))
        .toThrow('"undefinedAttribute" property or method is undefined for Context instance');

      expect(get(context, 'then')).toBeUndefined();
    });

    it('should create instance for lambda request with body JSON', () => {
      const lambdaRequest = {
        body: JSON.stringify({ status: 'ok' }),
        headers: {},
        operationId,
      } as LambdaRequest;

      const context = new Context({ spec, validator }, lambdaRequest);

      expect(context.query).toEqual({});
      expect(context.bodyJson).toEqual(JSON.stringify({ status: 'ok' }));
      expect(context.mutation).toEqual({ status: 'ok' });
    });

    it('should create instance for lambda request with body object and query string parameters', () => {
      const lambdaRequest = {
        body: { status: 'ok' },
        headers: {},
        operationId,
        queryStringParameters: { id: 'ID' },
      } as LambdaRequest;

      const context = new Context({ spec, validator }, lambdaRequest);

      expect(context.query).toEqual({ id: 'ID' });
      expect(context.bodyJson).toEqual(JSON.stringify({ status: 'ok' }));
      expect(context.mutation).toEqual({ status: 'ok' });
    });

    it('should create instance for HTTP request', () => {
      const uuid = randomUUID();
      const items = ['a', 'b', 'c'];
      const itemsJson = JSON.stringify(items);

      const httpRequest = {
        url: `http://localhost/api/${operationId}?id=ID&items=${itemsJson}`,
        path: `/api/${operationId}`,
        method: 'get',
        headers: { Accept: 'application/json' },
        requestContext: {
          requestId: uuid,
        },
      } as HttpRequest;

      const context = new Context({ spec, validator }, httpRequest);

      expect(context.query).toEqual({ id: 'ID', items });
      expect(context.logger).toBe(console);
      expect(context.headers).toEqual({ accept: 'application/json' });
      expect(context.httpPath).toEqual(`/${operationId}`);
      expect(context.bodyJson).toBeNull();
      expect(context.mutation).toBeNull();
      expect(context.identity).toEqual({});
      expect(context.requestId).toEqual(uuid);
      expect(context.validator).toBe(validator);
      expect(context.httpMethod).toEqual('get');
      expect(context.operationId).toBe(operationId);
      expect(context.requestReceivedAt).toBeDefined();
    });

    it('should create instance for HTTP request with httpMethod and without path', () => {
      const uuid = randomUUID();

      const httpRequest = {
        url: `http://localhost/api/${operationId}?id=ID`,
        headers: { Accept: 'application/json' },
        httpMethod: 'get',
        requestContext: {
          requestId: uuid,
        },
      } as HttpRequest;

      const context = new Context({ spec, validator }, httpRequest);

      expect(context.httpPath).toEqual(`/${operationId}`);
      expect(context.httpMethod).toEqual('get');
      expect(context.operationId).toBe(operationId);
    });
  });
});
