import { Profile } from '../../../example/documents';
import { createContext } from '../../Context/__tests__/__helpers';
import { type HttpRequest } from '../../Context';
import { Component, createAccessToken, Service } from '../../';
import { service, operations, url, path, logger, } from '../../../example';

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

      expect(() => new Service([ User, ...operations ], { url, path }))
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

      expect(body).toEqual({
        info: {
          title: '@kravc/dos',
          version: '2.0.0-alpha.0',
        },
      });
    });

    it('returns composer file for /Enums.yaml path', async () => {
      const request = {
        path: '/Enums.yaml',
        method: 'get'
      } as HttpRequest;

      const { statusCode } = await service.process(request);

      expect(statusCode).toEqual(200);
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

      const service = new Service(operations, { url, path, createContext, context: { logger } });

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
