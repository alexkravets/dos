import { unset } from 'lodash';
import { wait, MemoryDocument } from '../../';
import { createContext, profileSchema } from '../../Context/__tests__/__helpers';
import { User, Profile, type ProfileAttributes } from './__helpers';
import { DocumentExistsError, DocumentNotFoundError } from '../../Operation';

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

    it('returns existing ID when predefined', () => {
      const id = Profile.createId({ id: 'TEST_ID' });
      expect(id).toEqual('TEST_ID');
    });
  });

  describe('MemoryDocument.defaultAttributesSchemaSource', () => {
    it('returns default attributes schema source', () => {
      expect(Profile.defaultAttributesSchemaSource).toBeDefined();
    });
  });

  describe('MemoryDocument.bodySchema', () => {
    it('returns document body schema', () => {
      expect(Profile.bodySchema.source).toEqual(profileSchema.source);
    });
  });

  describe('MemoryDocument._extendWithDeletedStamps', () => {
    it('returns document body schema', () => {
      const mutation = {
        deletedAt: undefined,
        deletedBy: undefined,
        deletedByUserName: undefined,
      };

      Profile._extendWithDeletedStamps(context, mutation);

      expect(mutation.deletedAt).toBeDefined();
      expect(mutation.deletedBy).toEqual('SYSTEM');
      expect(mutation.deletedByUserName).toBeNull();
    });
  });

  describe('MemoryDocument.create(context, query, mutation)', () => {
    it('creates a document from mutation', async () => {
      const profile = await Profile.create(context, {}, attributes);

      expect(profile.id).toBeDefined();
      expect(profile.name).toEqual('John Doe');
      expect(profile.attributes.createdAt).toBeDefined();
      expect(profile.attributes.createdBy).toEqual('SYSTEM');
      expect(profile.attributes.createdByUserName).toBeNull();
    });

    it('creates a document from query', async () => {
      const profile = await Profile.create(context, attributes);

      expect(profile.id).toBeDefined();
      expect(profile.name).toEqual('John Doe');
    });

    it('creates a document with context identity', async () => {
      const identity = { sub: 'TEST_USER_ID', name: 'John Doe' };
      const context = createContext({ identity });

      const profile = await Profile.create(context, attributes);

      expect(profile.id).toBeDefined();
      expect(profile.name).toEqual('John Doe');
      expect(profile.attributes.createdAt).toBeDefined();
      expect(profile.attributes.createdBy).toEqual('TEST_USER_ID');
      expect(profile.attributes.createdByUserName).toEqual('John Doe');
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
      expect(profile.attributes.updatedAt).toBeDefined();
      expect(profile.attributes.updatedBy).toEqual('SYSTEM');
      expect(profile.attributes.updatedByUserName).toBeNull();
    });

    it('updates a document with context identity', async () => {
      const identity = { sub: 'TEST_USER_ID', name: 'John Doe' };
      const context = createContext({ identity });

      const createdProfile = await Profile.create(context, attributes);
      const { id } = createdProfile;

      const mutation = { name: 'Jane Doe' };
      const profile = await Profile.update(context, { id }, mutation);

      expect(profile.name).toEqual('Jane Doe');
      expect(profile.attributes.updatedAt).toBeDefined();
      expect(profile.attributes.updatedBy).toEqual('TEST_USER_ID');
      expect(profile.attributes.updatedByUserName).toEqual('John Doe');
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
    it('returns all documents in default sort order', async () => {
      await Profile.create(context, { name: 'John Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Josh Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Jenn Doe' });
      await wait(10);
      await Profile.create(context, { name: 'James Doe' });

      const { count, objects } = await Profile.indexAll(context);

      expect(count).toEqual(4);

      const [ profile ] = objects;
      expect(profile.name).toEqual('James Doe');
    });

    it('returns all documents in ascending sort order', async () => {
      await Profile.create(context, { name: 'John Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Josh Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Jenn Doe' });
      await wait(10);
      await Profile.create(context, { name: 'James Doe' });

      const sort = 'asc';
      const { count, objects } = await Profile.indexAll(context, {}, { sort });

      expect(count).toEqual(4);

      const [ profile ] = objects;
      expect(profile.name).toEqual('John Doe');
    });
  });

  describe('MemoryDocument.index(context, query, options)', () => {
    it('returns documents in batches', async () => {
      await Profile.create(context, { name: 'John Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Josh Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Jenn Doe' });
      await wait(10);
      await Profile.create(context, { name: 'James Doe' });

      const limit = 2;

      const {
        count: count1,
        objects: objects1,
        lastEvaluatedKey: exclusiveStartKey
      } = await Profile.index(context, {}, { limit });

      expect(count1).toEqual(2);
      expect(objects1.length).toEqual(2);
      expect(exclusiveStartKey).toEqual(objects1[1].id);

      const {
        count: count2,
        objects: objects2,
        lastEvaluatedKey: lastEvaluatedKey1
      } = await Profile.index(context, {}, { limit, exclusiveStartKey });

      expect(count2).toEqual(2);
      expect(objects2.length).toEqual(2);
      expect(lastEvaluatedKey1).toBeUndefined();
    });

    it('supports descending sort option', async () => {
      await Profile.create(context, { name: 'John Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Josh Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Jenn Doe' });
      await wait(10);
      await Profile.create(context, { name: 'James Doe' });

      const sort = 'desc';
      const limit = 1;

      const { count, objects, lastEvaluatedKey } = await Profile.index(context, {}, { sort, limit });

      expect(count).toEqual(1);
      expect(objects.length).toEqual(1);
      expect(objects[0].id).toEqual(lastEvaluatedKey);
      expect(objects[0].name).toEqual('James Doe');
    });

    it('supports default options', async () => {
      await Profile.create(context, { name: 'John Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Josh Doe' });
      await wait(10);
      await Profile.create(context, { name: 'Jenn Doe' });
      await wait(10);
      await Profile.create(context, { name: 'James Doe' });

      const { count, objects, lastEvaluatedKey } = await Profile.index(context);

      expect(count).toEqual(4);
      expect(objects.length).toEqual(4);
      expect(lastEvaluatedKey).toBeUndefined();
      expect(objects[0].name).toEqual('James Doe');
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

  describe('MemoryDocument.schema', () => {
    it('returns document schema', () => {
      const schema = profileSchema.extend(Profile.defaultAttributesSchemaSource, 'Profile');

      expect(Profile.schema).toEqual(schema);
    });

    it('validates the document', async () => {
      const profile = await Profile.create(context, { name: 'John Doe' });

      expect(() => profile.validate())
        .not.toThrow();
    });

    it('throws ValidationError for invalid document attributes', async () => {
      const profile = await Profile.create(context, { name: 'John Doe' });
      unset(profile, '_attributes.name');

      expect(() => profile.validate())
        .toThrow('"Profile" validation failed');
    });

    it('throws exception if document schema is not defined', () => {
      /** No schema document example. */
      class NoSchemaProfile extends MemoryDocument<ProfileAttributes> {
      }

      expect(() => NoSchemaProfile.schema)
        .toThrow('Schema is not set for "NoSchemaProfile"');
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
