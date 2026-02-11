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
      const request = {
        body: JSON.stringify({ status: 'ok' }),
        headers: {},
        operationId,
      } as LambdaRequest;

      const context = createContext({ request });

      expect(context.query).toEqual({});
      expect(context.bodyJson).toEqual(JSON.stringify({ status: 'ok' }));
      expect(context.mutation).toEqual({ status: 'ok' });
    });

    it('should create instance for lambda request with body object and query string parameters', () => {
      const request = {
        body: { status: 'ok' },
        headers: {},
        operationId,
        queryStringParameters: { id: 'ID' },
      } as LambdaRequest;

      const context = createContext({ request });

      expect(context.query).toEqual({ id: 'ID' });
      expect(context.bodyJson).toEqual(JSON.stringify({ status: 'ok' }));
      expect(context.mutation).toEqual({ status: 'ok' });
    });

    it('should create instance for HTTP request', () => {
      const uuid = randomUUID();
      const items = ['a', 'b', 'c'];
      const itemsJson = JSON.stringify(items);

      const request = {
        url: `http://localhost/api/${operationId}?id=ID&items=${itemsJson}`,
        path: `/api/${operationId}`,
        method: 'get',
        headers: { Accept: 'application/json' },
        requestContext: {
          requestId: uuid,
        },
      } as HttpRequest;

      const context = createContext({ request });

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

      const request = {
        url: `http://localhost/api/${operationId}?id=ID`,
        headers: { Accept: 'application/json' },
        httpMethod: 'get',
        requestContext: {
          requestId: uuid,
        },
      } as HttpRequest;

      const context = createContext({ request });

      expect(context.httpPath).toEqual(`/${operationId}`);
      expect(context.httpMethod).toEqual('get');
      expect(context.operationId).toBe(operationId);
    });

    it('should create instance for local HTTP request', () => {
      const uuid = randomUUID();

      const request = {
        url: `/${operationId}?id=ID`,
        headers: { Accept: 'application/json' },
        httpMethod: 'get',
        requestContext: {
          requestId: uuid,
        },
      } as HttpRequest;

      const context = createContext({ request });

      expect(context.httpPath).toEqual(`/${operationId}`);
      expect(context.httpMethod).toEqual('get');
      expect(context.operationId).toBe(operationId);
    });
  });

  describe('.set(name, value)', () => {
    it('add value to the context runtime', () => {
      const context = createContext();
      context.set('example', 'test');

      expect(context.get('example')).toEqual('test');
    });
  });

  describe('.get(name)', () => {
    it('returns value if variable is set', () => {
      const context = createContext();
      context.set('example', 'test');

      expect(context.get('example')).toEqual('test');
    });

    it('returns null value if variable is not set', () => {
      const context = createContext();

      expect(context.get('example')).toBeNull();
    });
  });

  describe('.got(name)', () => {
    it('returns value if variable is set', () => {
      const context = createContext();
      context.set('example', 'test');

      expect(context.got('example')).toEqual('test');
    });

    it('throws exception if variable is not set', () => {
      const context = createContext();

      expect(() => context.got('example'))
        .toThrow('Context runtime is missing "example" value, runtime: {}');
    });
  });

  describe('.runtimeReset(name)', () => {
    it('resets context runtime', () => {
      const context = createContext();
      context.set('example', 'test');

      expect(context.get('example')).toEqual('test');

      context.runtimeReset();

      expect(context.get('example')).toBeNull();
    });
  });

  describe('.identityId', () => {
    it('returns users ID from context identity', () => {
      const identity = { sub: 'TEST_USER_ID' };
      const context = createContext({ identity });

      expect(context.identityId).toEqual('TEST_USER_ID');
    });

    it('returns SYSTEM if context has no identity', () => {
      const context = createContext();

      expect(context.identityId).toEqual('SYSTEM');
    });

    it('returns SYSTEM if context identity has no subject claim', () => {
      const identity = {};
      const context = createContext({ identity });

      expect(context.identityId).toEqual('SYSTEM');
    });
  });

  describe('.identityName', () => {
    it('returns users name from context identity name claim', () => {
      const identity = { name: 'John Doe' };
      const context = createContext({ identity });

      expect(context.identityName).toEqual('John Doe');
    });

    it('returns users name from context identity first and last name claims', () => {
      const identity = { firstName: 'John', lastName: 'Doe' };
      const context = createContext({ identity });

      expect(context.identityName).toEqual('John Doe');
    });

    it('returns null if context has no identity', () => {
      const context = createContext();

      expect(context.identityName).toBeNull();
    });

    it('returns null if context identity has no name related claims', () => {
      const identity = {};
      const context = createContext({ identity });

      expect(context.identityName).toBeNull();
    });
  });

  describe('.toJSON()', () => {
    it('returns JSON serializable object', () => {
      const identity = { name: 'John Doe' };
      const context = createContext({ identity });

      expect(context.toJSON()).toEqual({
        bodyJson: null,
        headers: {},
        httpMethod: 'get',
        httpPath: '/TestOperationId',
        identity: {
          name: 'John Doe',
        },
        mutation: null,
        operationId: 'TestOperationId',
        query: {},
        requestId: context.requestId,
        requestReceivedAt: context.requestReceivedAt,
        runtime: {},
      });
    });
  });

  describe('.[inspect.custom]()', () => {
    it('returns object serializable for logging', () => {
      const context = createContext();
      console.log(context);
    });
  });

  describe('.isLive', () => {
    it('flags if running in non test environment', () => {
      const context = createContext();
      expect(context.isLive).toEqual(true);
    });
  });
});
