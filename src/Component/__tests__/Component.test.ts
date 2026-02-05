import Component from '../Component';
import { Validator, loadSync, Schema } from '@kravc/schema';
import { Context } from '../../Context';

// eslint-disable-next-line jsdoc/require-jsdoc
class Profile extends Component {}
Profile.schema = loadSync(require.resolve('../../examples/Profile.yaml')) as Schema;

// eslint-disable-next-line jsdoc/require-jsdoc
class User extends Component {}
// User.schema intentionally not set to test undefined schema

describe('Component', () => {
  const mockLogger = {
    error: jest.fn()
  };

  const validator = new Validator([Profile.schema!]);

  const attributes = {
    id: 'PROFILE_ID',
    name: 'Oleksandr'
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  const createContext = (): Context => ({
    validator,
    logger: mockLogger
  });

  describe('static properties', () => {
    describe('static id', () => {
      it('returns component class name', () => {
        expect(Profile.id).toBe('Profile');
        expect(User.id).toBe('User');
      });
    });

    describe('static name', () => {
      it('returns component class name', () => {
        expect(Profile.name).toBe('Profile');
        expect(User.name).toBe('User');
      });
    });

    describe('static schema', () => {
      it('returns undefined when schema is not set', () => {
        expect(User.schema).toBeUndefined();
      });

      it('returns schema when schema is set', () => {
        expect(Profile.schema).toBeDefined();
        expect(Profile.schema).toEqual(expect.objectContaining({
          _source: expect.any(Object)
        }));
      });

      it('allows setting schema', () => {
        const testSchema = loadSync(require.resolve('../../examples/Profile.yaml')) as Schema;
        // eslint-disable-next-line jsdoc/require-jsdoc
        const TestComponent = class extends Component {};

        expect(TestComponent.schema).toBeUndefined();
        TestComponent.schema = testSchema;
        expect(TestComponent.schema).toBeDefined();
        expect(TestComponent.schema).toEqual(testSchema);
      });
    });
  });

  describe('Component.constructor(context = {}, attributes = {})', () => {
    it('creates component with valid context and attributes', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(profile.id).toEqual('PROFILE_ID');
      expect(profile.componentId).toEqual('Profile');
      expect(profile.context).toEqual(context);
      expect(profile.attributes).toEqual(attributes);
    });

    it('creates component with null id', () => {
      const context = createContext();
      const profile = new Profile(context, { ...attributes, id: null });

      expect(profile.id).toBeNull();
      expect(profile.componentId).toEqual('Profile');
    });

    it('creates component with undefined id', () => {
      const context = createContext();
      const profile = new Profile(context, { name: 'Oleksandr' });

      expect(profile.id).toBeNull();
      expect(profile.componentId).toEqual('Profile');
    });

    it('creates component with empty attributes', () => {
      const context = createContext();
      const profile = new Profile(context, {});

      expect(profile.id).toBeNull();
      expect(profile.attributes).toEqual({});
    });

    it('throws error if validator is undefined', () => {
      expect(() => {
        new Profile({ logger: mockLogger } as unknown as Context, {});
      }).toThrow('Validator is undefined for "Profile:null"');
    });

    it('throws error with correct componentId and id in error message', () => {
      expect(() => {
        new Profile({ logger: mockLogger } as unknown as Context, { id: 'TEST_ID' });
      }).toThrow('Validator is undefined for "Profile:TEST_ID"');
    });
  });

  describe('.id', () => {
    it('returns id when id is provided', () => {
      const context = createContext();
      const profile = new Profile(context, { id: 'TEST_ID', name: 'Test' });

      expect(profile.id).toBe('TEST_ID');
    });

    it('returns null when id is not provided', () => {
      const context = createContext();
      const profile = new Profile(context, { name: 'Test' });

      expect(profile.id).toBeNull();
    });

    it('returns null when id is null', () => {
      const context = createContext();
      const profile = new Profile(context, { id: null, name: 'Test' });

      expect(profile.id).toBeNull();
    });
  });

  describe('.componentId', () => {
    it('returns component class name', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);
      const user = new User(context, { id: 'USER_ID' });

      expect(profile.componentId).toBe('Profile');
      expect(user.componentId).toBe('User');
    });
  });

  describe('.context', () => {
    it('returns component instance context', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(profile.context).toBe(context);
      expect(profile.context.validator).toBe(validator);
      expect(profile.context.logger).toBe(mockLogger);
    });
  });

  describe('.attributes', () => {
    it('returns component attributes', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(profile.attributes).toEqual(attributes);
      expect(profile.attributes.id).toBe('PROFILE_ID');
      expect(profile.attributes.name).toBe('Oleksandr');
    });

    it('returns empty object when attributes are empty', () => {
      const context = createContext();
      const profile = new Profile(context, {});

      expect(profile.attributes).toEqual({});
    });

    it('returns all provided attributes', () => {
      const context = createContext();
      const extendedAttributes = {
        ...attributes,
        email: 'test@example.com',
        age: 30,
        active: true
      };
      const profile = new Profile(context, extendedAttributes);

      expect(profile.attributes).toEqual(extendedAttributes);
    });
  });

  describe('.json', () => {
    it('returns JSON stringified component attributes', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      const json = profile.json;
      expect(json).toEqual(attributes);
      expect(json.id).toBe('PROFILE_ID');
      expect(json.name).toBe('Oleksandr');
    });

    it('returns valid JSON for complex attributes', () => {
      const context = createContext();
      const complexAttributes = {
        id: 'TEST_ID',
        name: 'Test',
        metadata: {
          created: '2024-01-01',
          tags: ['tag1', 'tag2']
        }
      };
      const profile = new Profile(context, complexAttributes);

      const json = profile.json;
      expect(json).toEqual(complexAttributes);
      expect(json.metadata).toEqual(complexAttributes.metadata);
    });

    it('excludes undefined values in JSON', () => {
      const context = createContext();
      const profile = new Profile(context, { id: 'TEST_ID', name: 'Test' });

      const json = profile.json;
      expect(json).not.toHaveProperty('undefined');
    });
  });

  describe('.toJSON()', () => {
    it('returns component attributes', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(profile.toJSON()).toEqual(attributes);
    });

    it('works with JSON.stringify', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      const jsonString = JSON.stringify(profile);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(attributes);
    });

    it('returns empty object when attributes are empty', () => {
      const context = createContext();
      const profile = new Profile(context, {});

      expect(profile.toJSON()).toEqual({});
    });
  });

  describe('.validate()', () => {
    it('validates JSON instance of the component successfully', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(() => {
        profile.validate();
      }).not.toThrow();
    });

    it('throws error if validation fails', () => {
      const context = createContext();
      const profile = new Profile(context, { ...attributes, id: null });

      expect(() => {
        profile.validate();
      }).toThrow('"Profile" validation failed');
    });

    it('validates using componentId as schema identifier', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      const validateSpy = jest.spyOn(validator, 'validate');
      profile.validate();

      expect(validateSpy).toHaveBeenCalledWith(
        expect.objectContaining(attributes),
        'Profile'
      );
      validateSpy.mockRestore();
    });
  });

  describe('withSafeAttributes integration', () => {
    it('allows access to defined properties', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(profile.id).toBe('PROFILE_ID');
      expect(profile.componentId).toBe('Profile');
      expect(profile.context).toBe(context);
      expect(profile.attributes).toEqual(attributes);
      expect(profile.attributes.name).toBe('Oleksandr');
    });

    it('allows access to methods', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(typeof profile.validate).toBe('function');
      expect(typeof profile.toJSON).toBe('function');
    });

    it('returns undefined for then property to prevent Promise confusion', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      // @ts-expect-error - Testing then property
      expect(profile.then).toBeUndefined();
    });

    it('throws error when accessing undefined property', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(() => {
        // @ts-expect-error - Testing undefined property access
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        profile.sex;
      }).toThrow('"sex" property or method is undefined for NoNameClass');
    });

    it('throws error when accessing undefined method', () => {
      const context = createContext();
      const profile = new Profile(context, attributes);

      expect(() => {
        // @ts-expect-error - Testing undefined method access
        profile.nonExistentMethod();
      }).toThrow();
    });
  });
});
