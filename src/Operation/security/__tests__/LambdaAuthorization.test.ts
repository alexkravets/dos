import { Profile } from '../../../../example/documents';
import { LambdaRequest } from '../../../Context';
import { createContext } from '../../../Context/__tests__/__helpers';
import { service, handler } from '../../../../example';

describe('LambdaAuthorization', () => {
  const operationId = 'ReadProfileSystem';
  const ReadProfileSystem = service.get(operationId);

  describe('LambdaAuthorization.createRequirement(options)', () => {
    it('extends operation with System security requirements', () => {
      expect(ReadProfileSystem.security[0].System).toBeDefined();
    });
  });

  describe('LambdaAuthorization.errors', () => {
    it('includes authorization related errors', () => {
      const errorCodes = Object.keys(ReadProfileSystem.errors);
      expect(errorCodes).toContain('AccessDeniedError');
    });
  });

  describe('.verify(context)', () => {
    it('returns AccessDeniedError if headers are set by the gateway for external request', async () => {
      const request = {
        operationId,
        headers: { Host: 'http://localhost:3000/' },
      } as LambdaRequest;

      const { statusCode, body: json } = await handler(request);

      expect(statusCode).toEqual(403);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'AccessDeniedError',
          message: 'Access denied, operation is available only for internal requests',
          statusCode: 403,
        }
      });
    });

    it('returns success if no headers are set by the gateway for internal request', async () => {
      const context = createContext();
      const { id } = await Profile.create(context, { name: 'John Doe' });

      const request = {
        operationId,
        queryStringParameters: { id },
      } as LambdaRequest;

      const { statusCode, body: json } = await handler(request);

      expect(statusCode).toEqual(200);

      const body = JSON.parse(json!);

      expect(body.data.name).toEqual('John Doe');
    });
  });
});
