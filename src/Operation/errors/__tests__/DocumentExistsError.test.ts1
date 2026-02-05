import DocumentExistsError from '../DocumentExistsError';
import CommonError from '../CommonError';

describe('DocumentExistsError', () => {
  // Mock document components for testing
  const Profile = { name: 'Profile' };
  const OrderItem = { name: 'OrderItem' };
  const UserProfile = { name: 'UserProfile' };

  describe('constructor', () => {
    it('creates an instance with correct code and formatted message', () => {
      const err = new DocumentExistsError(Profile, { id: '123' });

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toBe('Profile already exists {\n  "id": "123"\n}');
    });

    it('formats document title correctly for camelCase names', () => {
      const err = new DocumentExistsError(OrderItem, { id: '456' });

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toBe('Order item already exists {\n  "id": "456"\n}');
    });

    it('formats document title correctly for PascalCase names', () => {
      const err = new DocumentExistsError(UserProfile, { id: '789' });

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toBe('User profile already exists {\n  "id": "789"\n}');
    });

    it('includes multiple parameters in formatted JSON', () => {
      const err = new DocumentExistsError(Profile, {
        id: '123',
        email: 'user@example.com'
      });

      expect(err.message).toBe(
        'Profile already exists {\n  "id": "123",\n  "email": "user@example.com"\n}'
      );
    });

    it('handles empty parameters object', () => {
      const err = new DocumentExistsError(Profile, {});

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toBe('Profile already exists {}');
    });

    it('handles nested parameters', () => {
      const err = new DocumentExistsError(Profile, {
        query: { id: '123' },
        mutation: { name: 'John' }
      });

      expect(err.message).toContain('Profile already exists');
      expect(err.message).toContain('"query"');
      expect(err.message).toContain('"mutation"');
      expect(err.message).toContain('"id": "123"');
      expect(err.message).toContain('"name": "John"');
    });

    it('handles parameters with various types', () => {
      const err = new DocumentExistsError(Profile, {
        id: '123',
        count: 42,
        active: true,
        tags: ['admin', 'user'],
        metadata: { version: 1 }
      });

      expect(err.message).toContain('"id": "123"');
      expect(err.message).toContain('"count": 42');
      expect(err.message).toContain('"active": true');
      expect(err.message).toContain('"tags"');
      expect(err.message).toContain('"metadata"');
    });

    it('preserves message as Error.message for stack traces', () => {
      const message = 'Profile already exists {\n  "id": "123"\n}';
      const err = new DocumentExistsError(Profile, { id: '123' });

      expect(err.message).toBe(message);
    });
  });

  describe('code', () => {
    it('returns "DocumentExistsError"', () => {
      expect(new DocumentExistsError(Profile, { id: '123' }).code).toBe('DocumentExistsError');
      expect(new DocumentExistsError(OrderItem, { id: '456' }).code).toBe('DocumentExistsError');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      expect(new DocumentExistsError(Profile, { id: '123' }).isCommonError).toBe(true);
      expect(new DocumentExistsError(OrderItem, {}).isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const documentExistsErr = new DocumentExistsError(Profile, { id: '123' });
      const plainErr = new Error('Oops');

      expect(documentExistsErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const err = new DocumentExistsError(Profile, { id: '123' });
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(DocumentExistsError);
    });

    it('has a non-empty stack when thrown', () => {
      let err: DocumentExistsError | undefined;
      try {
        throw new DocumentExistsError(Profile, { id: '123' });
      } catch (e) {
        err = e as DocumentExistsError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Profile already exists');
      expect(err!.stack).toContain('DocumentExistsError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code and message when thrown and caught', () => {
      const parameters = { id: '123', email: 'user@example.com' };

      let caught: DocumentExistsError | undefined;
      try {
        throw new DocumentExistsError(Profile, parameters);
      } catch (e) {
        caught = e as DocumentExistsError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('DocumentExistsError');
      expect(caught!.message).toBe(
        'Profile already exists {\n  "id": "123",\n  "email": "user@example.com"\n}'
      );
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const parameters = { id: '123' };

      let caught: CommonError | undefined;
      try {
        throw new DocumentExistsError(Profile, parameters);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('DocumentExistsError');
      expect(caught!.message).toBe('Profile already exists {\n  "id": "123"\n}');
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const err = new DocumentExistsError(Profile, { id: '123' });

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('DocumentExistsError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const err = new DocumentExistsError(Profile, { id: '123' });

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toContain('Profile already exists');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with simple ID parameter for create operation conflicts', () => {
      const err = new DocumentExistsError(Profile, { id: '123' });

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toBe('Profile already exists {\n  "id": "123"\n}');
      expect(err.isCommonError).toBe(true);
    });

    it('works with query and mutation parameters from Document.create()', () => {
      const err = new DocumentExistsError(Profile, {
        query: {},
        mutation: { id: '123', name: 'John' }
      });

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toContain('Profile already exists');
      expect(err.message).toContain('"query"');
      expect(err.message).toContain('"mutation"');
      expect(err.message).toContain('"id": "123"');
      expect(err.message).toContain('"name": "John"');
      expect(err.isCommonError).toBe(true);
    });

    it('works with unique constraint violations (email)', () => {
      const err = new DocumentExistsError(Profile, { email: 'user@example.com' });

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toBe('Profile already exists {\n  "email": "user@example.com"\n}');
      expect(err.isCommonError).toBe(true);
    });

    it('works with composite keys for idempotency checks', () => {
      const err = new DocumentExistsError(OrderItem, {
        orderId: '456',
        productId: '789'
      });

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toBe(
        'Order item already exists {\n  "orderId": "456",\n  "productId": "789"\n}'
      );
      expect(err.isCommonError).toBe(true);
    });

    it('works with complex nested parameters', () => {
      const err = new DocumentExistsError(Profile, {
        query: { id: '123' },
        options: { includeDeleted: false }
      });

      expect(err.code).toBe('DocumentExistsError');
      expect(err.message).toContain('Profile already exists');
      expect(err.message).toContain('"query"');
      expect(err.message).toContain('"options"');
      expect(err.message).toContain('"includeDeleted": false');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('message formatting', () => {
    it('formats JSON parameters with 2-space indentation', () => {
      const err = new DocumentExistsError(Profile, { id: '123', name: 'John' });
      const lines = err.message.split('\n');

      // Check that JSON is properly formatted with indentation
      expect(lines[0]).toBe('Profile already exists {');
      expect(lines[1]).toMatch(/^ {2}"id"/);
      expect(lines[2]).toMatch(/^ {2}"name"/);
      expect(lines[3]).toBe('}');
    });

    it('handles special characters in parameter values', () => {
      const err = new DocumentExistsError(Profile, {
        email: 'user+test@example.com',
        name: 'John "Johnny" Doe'
      });

      expect(err.message).toContain('user+test@example.com');
      // JSON.stringify escapes quotes, so " becomes \"
      expect(err.message).toContain('John \\"Johnny\\" Doe');
    });

    it('handles null and undefined values in parameters', () => {
      const err = new DocumentExistsError(Profile, {
        id: '123',
        deletedAt: null,
        metadata: undefined
      });

      expect(err.message).toContain('"id": "123"');
      expect(err.message).toContain('"deletedAt": null');
      // undefined values are omitted from JSON.stringify
      expect(err.message).not.toContain('undefined');
    });
  });
});
