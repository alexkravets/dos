import { service } from '../../../../example';
import { Profile } from '../../../../example/documents';
import { createContext } from '../../../Context/__tests__/__helpers';
import { createAccessToken, execute, type Logger } from '../../../../src';

const logger = {
  ...console,
  /** Mock logger dir method to prevent output in tests. */
  dir: () => {},
  /** Mock logger info method to prevent output in tests. */
  info: () => {},
  /** Mock logger error method to prevent output in tests. */
  error: () => {},
} as Logger;

describe('execute(service, options)', () => {
  const { exec, request, expectError } = execute(service, { logger });

  it('creates helpers with default options', async () => {
    expect(() => execute(service))
      .not
      .toThrow();
  });

  describe('exec(operationId, parameters, headers)', () => {
    it('executes service operation with parameters and response', async () => {
      const Authorization = createAccessToken({}, { permissions: ['profiles-write'] });
      const headers = { Authorization };

      const parameters = { mutation: { name: 'John Doe' } };
      const { statusCode, result } = await exec('CreateProfile', parameters, headers);

      expect(statusCode).toEqual(201);
      expect(result.data.name).toEqual('John Doe');
    });

    it('executes service operation with parameters and no response', async () => {
      const Authorization = createAccessToken({}, { permissions: ['profiles-write'] });
      const headers = { Authorization };

      const context = createContext();
      const { id } = await Profile.create(context, { name: 'John Doe' });

      const parameters = { id };
      const { statusCode, result } = await exec('DeleteProfile', parameters, headers);

      expect(result).toBeUndefined();
      expect(statusCode).toEqual(204);
    });

    it('throws an error if execution of operation failed', async () => {
      const { statusCode, result } = await exec('CreateProfile');

      expect(statusCode).toEqual(401);
      expect(result).toEqual({
        error: {
          code: 'UnauthorizedError',
          message: 'Header "authorization" is missing',
          statusCode: 401
        }
      });
    });
  });

  describe('request(operationId, parameters, headers)', () => {
    it('executes service operation with parameters and response', async () => {
      const Authorization = createAccessToken({}, { permissions: ['profiles-write'] });
      const headers = { Authorization };

      const parameters = { mutation: { name: 'John Doe' } };
      const data = await request('CreateProfile', parameters, headers);

      expect(data.name).toEqual('John Doe');
    });

    it('executes service operation with parameters and no response', async () => {
      const Authorization = createAccessToken({}, { permissions: ['profiles-write'] });
      const headers = { Authorization };

      const context = createContext();
      const { id } = await Profile.create(context, { name: 'John Doe' });

      const parameters = { id };
      const data = await request('DeleteProfile', parameters, headers);

      expect(data).toBeUndefined();
    });

    it('throws an error if execution of operation failed', async () => {
      expect(request('CreateProfile'))
        .rejects
        .toThrow('RequestError for "CreateProfile"');
    });
  });

  describe('expectError(errorCode, operationId, parameters, headers)', () => {
    it('expects operation execution to fail with an error code', async () => {
      const errorCode = 'UnauthorizedError';

      const error = await expectError(errorCode, 'CreateProfile');
      expect(error.code).toEqual(errorCode);
    });

    it('throws an error if execution of operation has failed with unexpected error', async () => {
      const errorCode = 'InvalidParametersError';
      const parameters = { mutation: { name: 'John Doe' } };

      expect(expectError(errorCode, 'CreateProfile', parameters))
        .rejects
        .toThrow('Unexpected error code received "UnauthorizedError", expected "InvalidParametersError"');
    });

    it('throws an error if execution of operation has not failed', async () => {
      const Authorization = createAccessToken({}, { permissions: ['profiles-write'] });
      const headers = { Authorization };

      const errorCode = 'UnauthorizedError';
      const parameters = { mutation: { name: 'John Doe' } };

      expect(expectError(errorCode, 'CreateProfile', parameters, headers))
        .rejects
        .toThrow('Success NOT expected for "CreateProfile"');
    });
  });
});
