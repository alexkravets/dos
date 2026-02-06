import { got } from '@kravc/schema';
import { MemoryDocument } from '../';
import Context, { type MutationMap } from '../../Context';
import { createContext, profileSchema } from '../../Context/__tests__/__helpers';
import { DocumentExistsError, DocumentNotFoundError } from '../../Operation';

export type ProfileAttributes = {
  name: string;
};

/** Example of a default document. */
class Profile extends MemoryDocument<ProfileAttributes> {
  /** Returns a profile name. */
  get name() {
    return this.attributes.name;
  }
}

Profile.schema = profileSchema;

/** Example of a document with custom getPartition method. */
class User extends MemoryDocument<ProfileAttributes> {
  /** Returns custom partition based off parameters. */
  static getPartition(_context: Context, parameters: MutationMap) {
    const name = got(parameters, 'name') as string;
    const partition = name[0].toUpperCase();

    return partition;
  }
}

User.schema = profileSchema;

describe('MemoryDocument', () => {
  const context = createContext({ schemas: [ Profile.schema, User.schema ] });

  const attributes = {
    name: 'John Doe'
  };

  beforeEach(async () => {
    await User.reset();
    await Profile.reset();

    context.runtimeReset();
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

    it('throws exception if document schema is not defined', () => {
      /** No schema document example. */
      class NoSchemaProfile extends MemoryDocument<ProfileAttributes> {
      }

      expect(() => NoSchemaProfile.schema)
        .toThrow('Schema is not set for "NoSchemaProfile"');
    });
  });

  describe('MemoryDocument.bodySchema', () => {
    it('returns document body schema', () => {
      expect(Profile.bodySchema.source).toEqual(profileSchema.source);
    });
  });

  describe('MemoryDocument.create(context, query, mutation)', () => {
    it('creates a document from mutation', async () => {
      const profile = await Profile.create(context, {}, attributes);

      expect(profile.id).toBeDefined();
      expect(profile.name).toEqual('John Doe');
    });

    it('creates a document from query', async () => {
      const profile = await Profile.create(context, attributes);

      expect(profile.id).toBeDefined();
      expect(profile.name).toEqual('John Doe');
    });

    it('returns created document from the context', async () => {
      const createdProfile = await Profile.create(context, attributes);
      context.set('createdDocument', createdProfile);

      const profile = await Profile.create(context, attributes);

      expect(profile.id).toEqual(createdProfile.id);
    });

    it('skips context created document if of other type', async () => {
      const createdProfile = await Profile.create(context, attributes);
      context.set('createdDocument', createdProfile);

      const user = await User.create(context, attributes);

      expect(user.id).not.toEqual(createdProfile.id);
    });

    it('throws DocumentExistsError if document with specified ID already exists', async () => {
      const createdProfile = await Profile.create(context, attributes);

      const { id } = createdProfile;
      const mutation = { id };

      await expect(Profile.create(context, mutation))
        .rejects
        .toThrow(DocumentExistsError);
    });
  });

  describe('MemoryDocument.read(context, query, options)', () => {
    it('returns document by ID', async () => {
      const createdProfile = await Profile.create(context, attributes);
      const { id } = createdProfile;

      const profile = await Profile.read(context, { id });

      expect(profile.id).toEqual(createdProfile.id);
    });

    it('throws DocumentNotFoundError if document not found by ID', async () => {
      await expect(Profile.read(context, { id: 'BAD_ID' }))
        .rejects
        .toThrow(DocumentNotFoundError);
    });
  });

  describe('MemoryDocument.update(context, query, mutation)', () => {
    it('updates a document', async () => {
      const createdProfile = await Profile.create(context, attributes);
      const { id } = createdProfile;

      const mutation = { name: 'Jane Doe' };
      const profile = await Profile.update(context, { id }, mutation);

      expect(profile.name).toEqual('Jane Doe');
    });

    it('throws DocumentNotFoundError if document not found by ID', async () => {
      const mutation = { name: 'Jane Doe' };
      await expect(Profile.update(context, { id: 'BAD_ID' }, mutation))
        .rejects
        .toThrow(DocumentNotFoundError);
    });
  });

  describe('MemoryDocument.delete(context, query)', () => {
    it('deletes a document', async () => {
      const createdProfile = await Profile.create(context, attributes);
      const { id } = createdProfile;

      const deletedProfile = await Profile.delete(context, { id });

      expect(deletedProfile.id).toEqual(id);
      await expect(Profile.read(context, { id }))
        .rejects
        .toThrow(DocumentNotFoundError);
    });

    it('throws DocumentNotFoundError if document not found by ID', async () => {
      await expect(Profile.delete(context, { id: 'BAD_ID' }))
        .rejects
        .toThrow(DocumentNotFoundError);
    });
  });

  describe('MemoryDocument.indexAll(context, query, options)', () => {
    it('returns all documents', async () => {
      const createdProfile = await Profile.create(context, attributes);

      const { count, objects } = await Profile.indexAll(context);

      expect(count).toEqual(1);

      const [ profile ] = objects;
      expect(profile.id).toEqual(createdProfile.id);
    });
  });

  describe('MemoryDocument.index(context, query, options)', () => {
    it('returns documents in batches', async () => {
      await Profile.create(context, { name: 'John Doe' });
      await Profile.create(context, { name: 'Josh Doe' });
      await Profile.create(context, { name: 'Jenn Doe' });
      await Profile.create(context, { name: 'James Doe' });

      const { count, objects, lastEvaluatedKey } = await Profile.index(context);

      expect(count).toEqual(4);
      expect(objects.length).toEqual(4);
      expect(lastEvaluatedKey).toBeUndefined();
    });
  });

  describe('MemoryDocument.getPartition(context, parameters)', () => {
    it('returns default partition', () => {
      expect(Profile.getPartition(context, {})).toBeUndefined();
    });

    it('supports custom method', async () => {
      await User.create(context, { name: 'John Doe' });

      const { count: count0 } = await User.index(context, { partition: 'A' });
      const { count: count1 } = await User.index(context, { partition: 'J' });

      expect(count0).toEqual(0);
      expect(count1).toEqual(1);
    });
  });

  describe('.hasAttributeChanged(path)', () => {
    it('returns true if attribute has been updated', async () => {
      const profile = await Profile.create(context, attributes);
      const { id } = profile;

      const updatedProfile = await Profile.update(context, { id }, { name: 'Josh Doe' });

      const hasIdChanged = updatedProfile.hasAttributeChanged('id');
      const hasNameChanged = updatedProfile.hasAttributeChanged('name');

      expect(hasIdChanged).toBeFalsy();
      expect(hasNameChanged).toBeTruthy();
    });

    it('uses document from the context runtime instead of a read', async () => {
      const profile = await Profile.create(context, attributes);

      const { id } = profile;
      context.set(id, profile);

      const updatedProfile = await Profile.update(context, { id }, { name: 'Josh Doe' });

      const hasIdChanged = updatedProfile.hasAttributeChanged('id');
      const hasNameChanged = updatedProfile.hasAttributeChanged('name');

      expect(hasIdChanged).toBeFalsy();
      expect(hasNameChanged).toBeTruthy();
    });

    it('throws exception if document has not been updated', async () => {
      const profile = await Profile.create(context, attributes);

      expect(() => profile.hasAttributeChanged('name'))
        .toThrow(`Profile ${profile.id} has not been updated`);
    });
  });

  describe('.update(mutation)', () => {
    it('updates document and document instance attributes', async () => {
      const profile = await Profile.create(context, attributes);

      await profile.update({ name: 'Josh Doe' });
      const hasNameChanged = profile.hasAttributeChanged('name');

      expect(hasNameChanged).toBeTruthy();
      expect(profile.name).toEqual('Josh Doe');
    });

    it('supports document with partition defined', async () => {
      const user = await User.create(context, attributes);

      await user.update({ name: 'Josh Doe' });
      const hasNameChanged = user.hasAttributeChanged('name');

      expect(hasNameChanged).toBeTruthy();
      expect(user.attributes.name).toEqual('Josh Doe');
    });
  });
});
