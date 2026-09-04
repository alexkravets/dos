import { Profile } from '../../../example/documents';
import { createContext } from '../../Context/__tests__/__helpers';
import { type HttpRequest } from '../../Context';
import {
  Component,
  createAccessToken,
  DocumentNotFoundError,
  Operation,
  Service,
  UnprocessableConditionError,
} from '../../';
import { service, operations, url, logger, } from '../../../example';

describe('Service', () => {
  describe('Service.constructor(modules, options)', () => {
    it('ensures service url ends with / and uses default options', () => {
      const service = new Service(operations);

      expect(service.baseUrl).toEqual('http://localhost:3000/');
    });

    it('throws exception if component schema is missing', () => {
      interface UserAttributes {
        name: string;
      };

      /** Example of a component without schema. */
      class User extends Component<UserAttributes> {
      }

      expect(() => new Service([ User, ...operations ], { url }))
        .toThrow('Schema for component "User" is not found');
    });
  });

  describe('.baseUrl', () => {
    it('returns service base URL', () => {
      expect(service.baseUrl).toEqual('http://localhost:3000/');
    });
  });

  describe('.process(request, extraContext)', () => {
    it('returns OperationNotFoundError if operation could not be found', async () => {
      const request = {
        path: '/',
        method: 'post'
      } as HttpRequest;

      const { body: json, statusCode } = await service.process(request, { env: 'test' });

      expect(statusCode).toEqual(404);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'OperationNotFoundError',
          message: 'Operation not found, {\n  "operationId": "undefined",\n  "httpMethod": "post",\n  "httpPath": "/"\n}',
          statusCode: 404,
        }
      });
    });

    it('returns InvalidInputError if operation input validation failed', async () => {
      const Authorization = createAccessToken({}, { permissions: [ 'profiles-write' ] });

      const request = {
        url: 'http://localhost:3000/CreateProfile',
        path: '/CreateProfile',
        method: 'post',
        headers: { Authorization }
      } as HttpRequest;

      const { body: json, statusCode } = await service.process(request, { env: 'test' });

      expect(statusCode).toEqual(400);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'InvalidInputError',
          message: 'Invalid operation input',
          statusCode: 400,
          validationErrors: [
            {
              code: 'INVALID_TYPE',
              path: '#/mutation',
              message: 'Expected type object but found type null',
            },
          ],
        }
      });
    });

    it('returns InvalidOutputError if operation output validation failed', async () => {
      const context = createContext();
      const { id } = await Profile.create(context, { example: 'test' });

      const Authorization = createAccessToken({}, { permissions: [ 'profiles-read' ] });

      const request = {
        url: `http://localhost:3000/ReadProfile?id=${id}`,
        path: '/ReadProfile',
        method: 'get',
        headers: { Authorization }
      } as HttpRequest;

      const { body: json, statusCode } = await service.process(request);

      expect(statusCode).toEqual(500);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'InvalidOutputError',
          message: 'Invalid operation output',
          statusCode: 500,
          validationErrors: [
            {
              code: 'OBJECT_MISSING_REQUIRED_PROPERTY',
              path: '#/data',
              message: 'Missing required property: name',
            },
          ],
        }
      });
    });

    it('returns a generic error if an operation throws an error it does not declare', async () => {
      /** Example of an operation throwing an error it does not declare. */
      class ReadHealth extends Operation {
        /** Throws an error the operation does not declare. */
        async before() {
          throw new DocumentNotFoundError(Profile, { id: 'PRF_1' });
        }
      }

      const healthService = new Service([ ReadHealth ], { url, context: { logger } });

      const request = {
        url: 'http://localhost:3000/ReadHealth',
        path: '/ReadHealth',
        method: 'get'
      } as HttpRequest;

      const { body: json, statusCode } = await healthService.process(request, { env: 'test' });

      expect(statusCode).toEqual(500);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'OperationError',
          message: 'Unexpected operation error',
          statusCode: 500,
        }
      });
    });

    it('returns the original error if an operation throws an error it declares', async () => {
      /** Example of an operation throwing an error it declares. */
      class ReadStatus extends Operation {
        /** Throws an error the operation declares. */
        async before() {
          throw new UnprocessableConditionError('Status is not available');
        }
      }

      const statusService = new Service([ ReadStatus ], { url, context: { logger } });

      const request = {
        url: 'http://localhost:3000/ReadStatus',
        path: '/ReadStatus',
        method: 'get'
      } as HttpRequest;

      const { body: json, statusCode } = await statusService.process(request, { env: 'test' });

      expect(statusCode).toEqual(422);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'UnprocessableConditionError',
          message: 'Status is not available',
          statusCode: 422,
        }
      });
    });

    it('returns swagger UI for / path', async () => {
      const request = {
        path: '/',
        method: 'get'
      } as HttpRequest;

      const { statusCode } = await service.process(request);

      expect(statusCode).toEqual(200);
    });

    it('returns "health" for / path in non-development environment', async () => {
      const request = {
        path: '/',
        method: 'get'
      } as HttpRequest;

      const { statusCode, body } = await service.process(request, { env: 'prd' });

      expect(statusCode).toEqual(200);
      expect(body).toEqual('healthy');
    });

    it('returns 404 status code for /favicon.ico path', async () => {
      const request = {
        path: '/favicon.ico',
        method: 'get'
      } as HttpRequest;

      const { statusCode } = await service.process(request);

      expect(statusCode).toEqual(404);
    });

    it('returns service specification for /spec path', async () => {
      const request = {
        path: '/spec',
        method: 'get'
      } as HttpRequest;

      const { statusCode } = await service.process(request);

      expect(statusCode).toEqual(200);
    });

    it('returns service info for /spec path in non-development environment', async () => {
      const request = {
        path: '/spec',
        method: 'get'
      } as HttpRequest;

      const { statusCode, body: json } = await service.process(request, { env: 'prd' });

      expect(statusCode).toEqual(200);

      const body = JSON.parse(json!);

      expect(body.info.title).toEqual('@kravc/dos');
    });

    it('returns composer file for /Enums.yaml path', async () => {
      const request = {
        path: '/Enums.yaml',
        method: 'get'
      } as HttpRequest;

      const { statusCode } = await service.process(request);

      expect(statusCode).toEqual(200);
    });

    it('returns operations grouped by document for /Operations.yaml path', async () => {
      const request = {
        path: '/Operations.yaml',
        method: 'get'
      } as HttpRequest;

      const { statusCode, body } = await service.process(request);

      expect(statusCode).toEqual(200);

      const data = JSON.parse(body!);

      expect(data).toEqual(expect.arrayContaining([
        expect.objectContaining({
          document: expect.any(String),
          operations: expect.any(Array),
        }),
      ]));
    });

    it('supports operations without parameters', async () => {
      const request = {
        path: '/Health',
        method: 'get'
      } as HttpRequest;

      const { statusCode } = await service.process(request);

      expect(statusCode).toEqual(204);
    });

    it('throws exception if failed to create context for a request', async () => {
      /** Creates context that simulates unexpected error. */
      const createContext = () => {
        throw Error('Simutated context error');
      };

      const service = new Service(operations, { url, createContext, context: { logger } });

      const request = {
        path: '/',
        method: 'get'
      } as HttpRequest;

      expect(service.process(request, { env: 'prd' }))
        .rejects
        .toThrow('Simutated context error');
    });
  });
});
