import { get } from 'lodash';
import { randomUUID } from 'crypto';
import { createContext } from './__helpers';
import type { LambdaRequest, HttpRequest } from '../Request';

describe('Context', () => {
  describe('Context.constructor(config, request, extraContext)', () => {
    const operationId = 'TestOperationId';

    it('should create instance for lambda request', () => {
      const context = createContext();

      expect(context.query).toEqual({});
      expect(context.logger).toBe(console);
      expect(context.headers).toEqual({});
      expect(context.httpPath).toEqual(`/${operationId}`);
      expect(context.bodyJson).toBeNull();
      expect(context.mutation).toBeNull();
      expect(context.identity).toEqual({});
      expect(context.requestId).toBeDefined();
      expect(context.validator).toBeDefined();
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

      const context = createContext(lambdaRequest);

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

      const context = createContext(lambdaRequest);

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

      const context = createContext(httpRequest);

      expect(context.query).toEqual({ id: 'ID', items });
      expect(context.logger).toBe(console);
      expect(context.headers).toEqual({ accept: 'application/json' });
      expect(context.httpPath).toEqual(`/${operationId}`);
      expect(context.bodyJson).toBeNull();
      expect(context.mutation).toBeNull();
      expect(context.identity).toEqual({});
      expect(context.requestId).toEqual(uuid);
      expect(context.validator).toBeDefined();
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

      const context = createContext(httpRequest);

      expect(context.httpPath).toEqual(`/${operationId}`);
      expect(context.httpMethod).toEqual('get');
      expect(context.operationId).toBe(operationId);
    });
  });
});
