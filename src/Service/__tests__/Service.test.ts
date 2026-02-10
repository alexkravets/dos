import { service } from '../../../example';
import { HttpRequest } from '../../Context';

describe('Service', () => {
  describe('Service.constructor(modules, options)', () => {
    it('ensures service url ends with /', () => {
    });

    it('throws exception if component schema is missing', () => {
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
  });
});
