import { get } from 'lodash';
import Component from '../';
import { createContext, profileAttributesSchema } from '../../Context/__tests__/__helpers';

export type ProfileAttributes = {
  id: string;
  name?: string;
};

/** Profile component. */
class Profile extends Component<ProfileAttributes> {
}

describe('Component', () => {
  const context = createContext();

  const attributes = {
    id: 'PRO_1',
    name: 'John Doe'
  };

  describe('Component.constructor(context = {}, attributes = {})', () => {
    it('creates component with valid context and attributes', () => {
      const profile = new Profile(context, attributes);

      expect(() => get(profile, 'undefinedAttribute'))
        .toThrow('"undefinedAttribute" property or method is undefined for Profile instance');
    });
  });

  describe('Component.idKey', () => {
    it('returns default ID attribute key', () => {
    });
  });

  describe('Component.isComponent', () => {
    it('returns true', () => {
      expect(Profile.isComponent).toBeTruthy();
    });
  });

  describe('Component.id', () => {
    it('returns ID of the component class', () => {
      expect(Profile.id).toEqual('Profile');
    });
  });

  describe('Component.schema', () => {
    it('returns undefined if schema not defined', () => {
      expect(Profile.schema).toBeUndefined();
      expect(Profile.mutationSchema).toBeUndefined();
    });
  });

  describe('Component.schema =', () => {
    it('sets component schema', () => {
      Profile.schema = profileAttributesSchema;

      expect(Profile.schema).toBeDefined();
      expect(Profile.mutationSchema).toBeDefined();
    });
  });

  describe('Component.getTitle(isCapitalized, isPlural)', () => {
    it('returns component title', () => {
      expect(Profile.getTitle(false)).toEqual('profile');
    });

    it('returns capitalized component title', () => {
      expect(Profile.getTitle()).toEqual('Profile');
    });

    it('returns plural component title', () => {
      expect(Profile.getTitle(false, true)).toEqual('profiles');
    });
  });

  describe('.id', () => {
    it('returns ID', () => {
      const profile = new Profile(context, attributes);
      expect(profile.id).toEqual('PRO_1');
    });
  });

  describe('.context', () => {
    it('returns context', () => {
      const profile = new Profile(context, attributes);
      expect(profile.context).toBeDefined();
    });
  });

  describe('.attributes', () => {
    it('returns component attributes', () => {
      const profile = new Profile(context, attributes);
      expect(profile.context).toBeDefined();
    });
  });

  describe('.componentId', () => {
    it('returns component class ID', () => {
      const profile = new Profile(context, attributes);
      expect(profile.componentId).toEqual('Profile');
    });
  });

  describe('.json', () => {
    it('returns normalized component attributes', () => {
      const profile = new Profile(context, attributes);
      expect(profile.json).toEqual({
        id: 'PRO_1',
        name: 'John Doe'
      });
    });
  });

  describe('.validate()', () => {
    it('throws validation error if invalid attributes', () => {
      const profile = new Profile(context, {} as ProfileAttributes);
      expect(() => profile.validate())
        .toThrow('"ProfileAttributes" validation failed');
    });
  });
});
