import DocumentNotFoundError from '../DocumentNotFoundError';
import CommonError from '../CommonError';

describe('DocumentNotFoundError', () => {
  // Mock document components for testing
  const Profile = { name: 'Profile' };
  const OrderItem = { name: 'OrderItem' };
  const UserProfile = { name: 'UserProfile' };

  describe('constructor', () => {
    it('creates an instance with correct code and formatted message', () => {
      const err = new DocumentNotFoundError(Profile, { id: '123' });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe('Profile not found {\n  "id": "123"\n}');
    });

    it('formats document title correctly for camelCase names', () => {
      const err = new DocumentNotFoundError(OrderItem, { id: '456' });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe('Order item not found {\n  "id": "456"\n}');
    });

    it('formats document title correctly for PascalCase names', () => {
      const err = new DocumentNotFoundError(UserProfile, { id: '789' });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe('User profile not found {\n  "id": "789"\n}');
    });

    it('includes multiple parameters in formatted JSON', () => {
      const err = new DocumentNotFoundError(Profile, {
        id: '123',
        email: 'user@example.com'
      });

      expect(err.message).toBe(
        'Profile not found {\n  "id": "123",\n  "email": "user@example.com"\n}'
      );
    });

    it('handles empty parameters object', () => {
      const err = new DocumentNotFoundError(Profile, {});

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe('Profile not found {}');
    });

    it('handles nested parameters (query and options)', () => {
      const err = new DocumentNotFoundError(Profile, {
        query: { id: '123' },
        options: { includeDeleted: false }
      });

      expect(err.message).toContain('Profile not found');
      expect(err.message).toContain('"query"');
      expect(err.message).toContain('"options"');
      expect(err.message).toContain('"id": "123"');
      expect(err.message).toContain('"includeDeleted": false');
    });

    it('handles parameters with various types', () => {
      const err = new DocumentNotFoundError(Profile, {
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
      const message = 'Profile not found {\n  "id": "123"\n}';
      const err = new DocumentNotFoundError(Profile, { id: '123' });

      expect(err.message).toBe(message);
    });
  });

  describe('code', () => {
    it('returns "DocumentNotFoundError"', () => {
      expect(new DocumentNotFoundError(Profile, { id: '123' }).code).toBe('DocumentNotFoundError');
      expect(new DocumentNotFoundError(OrderItem, { id: '456' }).code).toBe('DocumentNotFoundError');
    });
  });

  describe('isCommonError', () => {
    it('is always true', () => {
      expect(new DocumentNotFoundError(Profile, { id: '123' }).isCommonError).toBe(true);
      expect(new DocumentNotFoundError(OrderItem, {}).isCommonError).toBe(true);
    });

    it('allows consumers to distinguish from unexpected errors', () => {
      const documentNotFoundErr = new DocumentNotFoundError(Profile, { id: '123' });
      const plainErr = new Error('Oops');

      expect(documentNotFoundErr.isCommonError).toBe(true);
      expect((plainErr as { isCommonError?: boolean }).isCommonError).toBeUndefined();
    });
  });

  describe('Error inheritance', () => {
    it('is an instance of Error', () => {
      const err = new DocumentNotFoundError(Profile, { id: '123' });
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(CommonError);
      expect(err).toBeInstanceOf(DocumentNotFoundError);
    });

    it('has a non-empty stack when thrown', () => {
      let err: DocumentNotFoundError | undefined;
      try {
        throw new DocumentNotFoundError(Profile, { id: '123' });
      } catch (e) {
        err = e as DocumentNotFoundError;
      }
      expect(err).toBeDefined();
      expect(err!.stack).toBeDefined();
      expect(err!.stack).toContain('Profile not found');
      expect(err!.stack).toContain('DocumentNotFoundError.test');
    });
  });

  describe('throw and catch', () => {
    it('preserves code and message when thrown and caught', () => {
      const parameters = { id: '123', email: 'user@example.com' };

      let caught: DocumentNotFoundError | undefined;
      try {
        throw new DocumentNotFoundError(Profile, parameters);
      } catch (e) {
        caught = e as DocumentNotFoundError;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('DocumentNotFoundError');
      expect(caught!.message).toBe(
        'Profile not found {\n  "id": "123",\n  "email": "user@example.com"\n}'
      );
      expect(caught!.isCommonError).toBe(true);
    });

    it('can be caught as CommonError', () => {
      const parameters = { id: '123' };

      let caught: CommonError | undefined;
      try {
        throw new DocumentNotFoundError(Profile, parameters);
      } catch (e) {
        caught = e as CommonError;
      }

      expect(caught).toBeDefined();
      expect(caught).toBeInstanceOf(CommonError);
      expect(caught!.code).toBe('DocumentNotFoundError');
      expect(caught!.message).toBe('Profile not found {\n  "id": "123"\n}');
      expect(caught!.isCommonError).toBe(true);
    });
  });

  describe('CommonError inheritance', () => {
    it('extends CommonError correctly', () => {
      const err = new DocumentNotFoundError(Profile, { id: '123' });

      expect(err).toBeInstanceOf(CommonError);
      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.isCommonError).toBe(true);
    });

    it('inherits all CommonError properties and methods', () => {
      const err = new DocumentNotFoundError(Profile, { id: '123' });

      expect(err).toHaveProperty('code');
      expect(err).toHaveProperty('message');
      expect(err).toHaveProperty('isCommonError');
      expect(err).toHaveProperty('stack');
      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toContain('Profile not found');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('usage scenarios', () => {
    it('works with simple ID parameter for read operation failures', () => {
      const err = new DocumentNotFoundError(Profile, { id: '123' });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe('Profile not found {\n  "id": "123"\n}');
      expect(err.isCommonError).toBe(true);
    });

    it('works with query and options parameters from Document.read()', () => {
      const err = new DocumentNotFoundError(Profile, {
        query: { id: '123' },
        options: { includeDeleted: false }
      });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toContain('Profile not found');
      expect(err.message).toContain('"query"');
      expect(err.message).toContain('"options"');
      expect(err.message).toContain('"id": "123"');
      expect(err.message).toContain('"includeDeleted": false');
      expect(err.isCommonError).toBe(true);
    });

    it('works with email parameter for custom query validation', () => {
      const err = new DocumentNotFoundError(Profile, { email: 'user@example.com' });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe('Profile not found {\n  "email": "user@example.com"\n}');
      expect(err.isCommonError).toBe(true);
    });

    it('works with composite keys for complex queries', () => {
      const err = new DocumentNotFoundError(OrderItem, {
        orderId: '456',
        productId: '789'
      });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe(
        'Order item not found {\n  "orderId": "456",\n  "productId": "789"\n}'
      );
      expect(err.isCommonError).toBe(true);
    });

    it('works for update operation failures (implicit via read)', () => {
      // Simulating what happens when Document.update() calls read() internally
      const err = new DocumentNotFoundError(Profile, { id: 'nonexistent' });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe('Profile not found {\n  "id": "nonexistent"\n}');
      expect(err.isCommonError).toBe(true);
    });

    it('works for delete operation failures (implicit via read)', () => {
      // Simulating what happens when Document.delete() calls read() internally
      const err = new DocumentNotFoundError(Profile, { id: 'nonexistent' });

      expect(err.code).toBe('DocumentNotFoundError');
      expect(err.message).toBe('Profile not found {\n  "id": "nonexistent"\n}');
      expect(err.isCommonError).toBe(true);
    });
  });

  describe('message formatting', () => {
    it('formats JSON parameters with 2-space indentation', () => {
      const err = new DocumentNotFoundError(Profile, { id: '123', name: 'John' });
      const lines = err.message.split('\n');

      // Check that JSON is properly formatted with indentation
      expect(lines[0]).toBe('Profile not found {');
      expect(lines[1]).toMatch(/^ {2}"id"/);
      expect(lines[2]).toMatch(/^ {2}"name"/);
      expect(lines[3]).toBe('}');
    });

    it('handles special characters in parameter values', () => {
      const err = new DocumentNotFoundError(Profile, {
        email: 'user+test@example.com',
        name: 'John "Johnny" Doe'
      });

      expect(err.message).toContain('user+test@example.com');
      // JSON.stringify escapes quotes, so " becomes \"
      expect(err.message).toContain('John \\"Johnny\\" Doe');
    });

    it('handles null and undefined values in parameters', () => {
      const err = new DocumentNotFoundError(Profile, {
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

  describe('distinguishing from DocumentExistsError', () => {
    it('has different code than DocumentExistsError', () => {
      const notFoundErr = new DocumentNotFoundError(Profile, { id: '123' });
      // Note: We can't import DocumentExistsError here without creating a circular dependency
      // but we can verify the code is correct
      expect(notFoundErr.code).toBe('DocumentNotFoundError');
      expect(notFoundErr.code).not.toBe('DocumentExistsError');
    });

    it('has different message format than DocumentExistsError', () => {
      const notFoundErr = new DocumentNotFoundError(Profile, { id: '123' });

      expect(notFoundErr.message).toContain('not found');
      expect(notFoundErr.message).not.toContain('already exists');
    });
  });
});
