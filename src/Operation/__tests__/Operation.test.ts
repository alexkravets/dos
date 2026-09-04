import { as } from '../../../example/security';
import { User } from '../../Document/__tests__/__helpers';
import { createContext } from '../../Context/__tests__/__helpers';
import { Operation, Create } from '../../../src';

/** Example of an operation without component attached. */
class Health extends Operation {
  /** Example of before hook that returns no parameters. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async before(parameters) {
  }

  /** Example of after hook that returns custom result. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async after(parameters, result) {
    return { status: 'ok' };
  }
}

describe('Operation', () => {
  describe('Operation.id', () => {
    it('returns operation ID', () => {
      expect(Health.id).toEqual('Health');
    });

    it('throws exception if operation class has no name', () => {
      // eslint-disable-next-line jsdoc/require-jsdoc
      expect(() => (class extends Operation {}).id)
        .toThrow('Operation ID is undefined');
    });
  });

  describe('Operation.tags', () => {
    it('returns no operation tags', () => {
      expect(Health.tags).toEqual([]);
    });
  });

  describe('Operation.summary', () => {
    it('returns empty operation summary', () => {
      expect(Health.summary).toEqual('');
    });
  });

  describe('Operation.errors', () => {
    it('returns security errors', () => {
      /** Example of an operation with security requirements. */
      class CreateUser extends as.User(Create(User)) {
      }

      const errorCodes = Object.keys(CreateUser.errors);
      expect(errorCodes).toContain('UnauthorizedError');
      expect(errorCodes).toContain('AccessDeniedError');
    });
  });

  describe('Operation.getErrorStatusCode()', () => {
    it('returns 500 HTTP status code for an unexpected error', () => {
      const error = new Error('Unexpected error');
      const statusCode = Health.getErrorStatusCode(error);
      expect(statusCode).toEqual(500);
    });
  });

  describe('Operation.hasError()', () => {
    it('returns true for a declared error code', () => {
      /** Example of an operation with a create action. */
      class CreateUser extends Create(User) {
      }

      expect(CreateUser.hasError('DocumentExistsError')).toBe(true);
    });

    it('returns false for an error code the operation does not declare', () => {
      /** Example of an operation with a create action. */
      class CreateUser extends Create(User) {
      }

      expect(CreateUser.hasError('DocumentNotFoundError')).toBe(false);
    });

    it('returns false for an error with no code', () => {
      expect(Health.hasError()).toBe(false);
    });
  });

  describe('Operation.output', () => {
    it('returns null', () => {
      expect(Health.output).toBeNull();
    });
  });

  describe('Operation.componentActionMethod', () => {
    it('throws exception', () => {
      expect(() => Health.componentActionMethod)
        .toThrow('Operation "Health" expects component to be defined');
    });

    it('throws exception if component action method is not defined', () => {
      /** Example of an operation class with missing component method. */
      class CreateUser extends Create(User, 'build') {
      }

      expect(() => CreateUser.componentActionMethod)
        .toThrow('Operation "CreateUser" expects component action method "User.build(context, ...)" to be defined');
    });
  });

  describe('.setHeader(name, value, isMultiValue)', () => {
    it('adds header to headers', async () => {
      const context = createContext({ request: { operationId: 'Health' } });
      const operation = new Health(context);

      operation.setHeader('x-example', 'example');

      const { headers } = await operation.exec({});

      expect(headers).toEqual({ 'x-example': 'example' });
    });

    it('adds header to multi value headers', async () => {
      const context = createContext({ request: { operationId: 'Health' } });
      const operation = new Health(context);

      operation.setHeader('x-example', 'example', true);

      const { multiValueHeaders } = await operation.exec({});

      expect(multiValueHeaders).toEqual({ 'x-example': 'example' });
    });
  });

  describe('.exec(input)', () => {
    it('returns result from after action', async () => {
      const context = createContext({ request: { operationId: 'Health' } });
      const operation = new Health(context);
      const { result, headers, multiValueHeaders } = await operation.exec({});

      expect(headers).toEqual({});
      expect(multiValueHeaders).toEqual({});

      expect(result).toEqual({ status: 'ok' });
    });

    it('returns result', async () => {
      /** Example of an operation with after hook. */
      class Health extends Operation {
        /** Example of after hook that returns no result. */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async after(parameters, result) {
        }
      }

      const context = createContext({ request: { operationId: 'Health' } });
      const operation = new Health(context);
      const { result, headers, multiValueHeaders } = await operation.exec({});

      expect(headers).toEqual({});
      expect(multiValueHeaders).toEqual({});

      expect(result).toEqual({});
    });
  });
});
