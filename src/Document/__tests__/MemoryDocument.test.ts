import { get } from 'lodash';
import { MemoryDocument } from '../';
import { createContext, profileSchema } from '../../Context/__tests__/__helpers';

export type ProfileAttributes = {
  id: string;
  name?: string;
};

/** Profile document. */
class Profile extends MemoryDocument<ProfileAttributes> {
  /** Returns name. */
  get name() {
    return this.attributes.name;
  }
}

Profile.schema = profileSchema;

describe('MemoryDocument', () => {
  const context = createContext();

  const attributes = {
    id: 'PRO_1',
    name: 'John Doe'
  };

  describe('MemoryDocument.constructor(context = {}, attributes = {})', () => {
    it('creates component with valid context and attributes', () => {
      const profile = new Profile(context, attributes);

      expect(profile.id).toEqual('PRO_1');
      expect(profile.name).toEqual('John Doe');

      expect(() => get(profile, 'undefinedAttribute'))
        .toThrow('"undefinedAttribute" property or method is undefined for Profile instance');
    });
  });

  describe('MemoryDocument.partitionKey', () => {
    it('returns default partition key', () => {
      expect(Profile.partitionKey).toEqual('partition');
    });
  });

  describe('MemoryDocument.idPrefix', () => {
    it('returns default id prefix', () => {
      expect(Profile.idPrefix).toEqual('Profile');
    });
  });

  describe('MemoryDocument.createId(attributes)', () => {
    it('returns ID for a new document', () => {
      expect(Profile.createId({})).toBeDefined();
    });
  });

  describe('MemoryDocument.defaultAttributesSchemaSource', () => {
    it('returns default attributes schema source', () => {
      expect(Profile.defaultAttributesSchemaSource).toBeDefined();
    });
  });

  describe('MemoryDocument.schema', () => {
    it('returns document schema', () => {
      const schema = profileSchema.extend(Profile.defaultAttributesSchemaSource, 'Profile');
      expect(Profile.schema).toEqual(schema);
    });
  });

  describe('MemoryDocument.bodySchema', () => {
    it('returns document body schema', () => {
      expect(Profile.bodySchema.source).toEqual(profileSchema.source);
    });
  });

  describe('MemoryDocument.getPartition(context, parameters)', () => {
    it('returns default partition', () => {
      expect(Profile.getPartition(context, {})).toBeUndefined();
    });
  });

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // const createProfile = () => {
  //   const attributes = { id: 'PRO_1' };
  //   const profile = new Profile(context, attributes);

  //   const name = profile.name;
  //   console.log({ name });
  // };

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // const indexProfiles = async () => {
  //   const { objects: profiles } = await Profile.index(context);
  //   const [ _profile ] = profiles;

  //   if (_profile) {
  //     console.log(_profile.name);
  //   }
  // };

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // const indexAllProfiles = async () => {
  //   const { objects: profiles } = await Profile.indexAll(context);
  //   const [ _profile ] = profiles;

  //   if (_profile) {
  //     console.log(_profile.name);
  //   }
  // };

  // // eslint-disable-next-line jsdoc/require-jsdoc
  // const readProfile = async () => {
  //   const query = { id: 'PRO_1' };
  //   const profile = await Profile.read(context, query);

  //   const name = profile.id;
  //   console.log({ name });
  // };
});
