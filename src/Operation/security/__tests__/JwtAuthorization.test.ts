import { LambdaRequest } from '../../../Context';
import { createContext } from '../../../Context/__tests__/__helpers';
import { stringifyCookie } from 'cookie';
import { service, handler } from '../../../../example';
import { JwtAuthorization, createAccessToken, TEST_PUBLIC_KEY as publicKey } from '../../../';

describe('JwtAuthorization', () => {
  const CreateProfile = service.get('CreateProfile');

  describe('JwtAuthorization.createRequirement(options)', () => {
    it('extends operation with Authorization security requirements', () => {
      expect(CreateProfile.security[0].Authorization).toBeDefined();
    });

    it('supports default access verification method', async () => {
      const Authorization = createAccessToken({}, { permissions: [] });

      const request = {
        headers: { authorization: Authorization },
        operationId: 'CreateProfile'
      } as LambdaRequest;

      const context = createContext({ request });

      const requirement = JwtAuthorization.createRequirement({ publicKey });
      const verify = requirement.Authorization.verify;

      const result = await verify(context);

      expect(result.isAuthorized).toBe(true);
    });
  });

  describe('JwtAuthorization.errors', () => {
    it('includes authorization related errors', () => {
      const errorCodes = Object.keys(CreateProfile.errors);
      expect(errorCodes).toContain('UnauthorizedError');
      expect(errorCodes).toContain('AccessDeniedError');
    });
  });

  describe('.verify(context)', () => {
    it('returns UnauthorizedError if no authorization header provided', async () => {
      const request = {
        operationId: 'CreateProfile',
      } as LambdaRequest;

      const { statusCode, body: json } = await handler(request);

      expect(statusCode).toEqual(401);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'UnauthorizedError',
          message: 'Header "authorization" is missing',
          statusCode: 401,
        }
      });
    });

    it('returns UnauthorizedError if invalid authorization header provided', async () => {
      const request = {
        operationId: 'CreateProfile',
        headers: {
          Authorization: 'INVALID_AUTHORIZATION_TOKEN',
        }
      } as LambdaRequest;

      const { statusCode, body: json } = await handler(request);

      expect(statusCode).toEqual(401);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'UnauthorizedError',
          message: 'Invalid "authorization" token',
          statusCode: 401,
        }
      });
    });

    it('returns UnauthorizedError if token is not verified as expired', async () => {
      const exp = Math.floor((new Date('2026-01-01T00:00:00Z').getTime()) / 1000);
      const Authorization = createAccessToken({}, { exp });

      const request = {
        operationId: 'CreateProfile',
        headers: {
          Authorization,
        }
      } as LambdaRequest;

      const { statusCode, body: json } = await handler(request);

      expect(statusCode).toEqual(401);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'UnauthorizedError',
          message: '"authorization" token verification failed: jwt expired',
          statusCode: 401,
        }
      });
    });

    it('returns AccessDeniedError if access verification failed', async () => {
      const Authorization = createAccessToken({}, { permissions: [] });

      const request = {
        operationId: 'CreateProfile',
        headers: {
          Authorization,
        }
      } as LambdaRequest;

      const { statusCode, body: json } = await handler(request);

      expect(statusCode).toEqual(403);

      const body = JSON.parse(json!);

      expect(body).toEqual({
        error: {
          code: 'AccessDeniedError',
          message: 'Access denied',
          statusCode: 403,
        }
      });
    });

    it('returns success for a valid authorization header', async () => {
      const Authorization = createAccessToken({}, { permissions: [ 'profiles-write' ] });

      const request = {
        operationId: 'CreateProfile',
        headers: {
          Authorization,
        },
        body: {
          name: 'John Doe',
        },
      } as LambdaRequest;

      const { statusCode, body: json } = await handler(request);

      expect(statusCode).toEqual(201);

      const body = JSON.parse(json!);

      expect(body.data.name).toEqual('John Doe');
    });

    it('returns success for a valid authorization cookie', async () => {
      const Authorization = createAccessToken({}, { permissions: [ 'profiles-write' ] });
      const cookie = stringifyCookie({ Authorization });

      const request = {
        operationId: 'CreateProfile',
        headers: {
          cookie,
        },
        body: {
          name: 'John Doe',
        },
      } as LambdaRequest;

      const { statusCode, body: json } = await handler(request);

      expect(statusCode).toEqual(201);

      const body = JSON.parse(json!);

      expect(body.data.name).toEqual('John Doe');
    });
  });
});
