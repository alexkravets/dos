import { MemoryDocument } from '../';
import { DocumentExistsError, DocumentNotFoundError } from '../../Operation';
import { createContext, profileSchema } from '../../Context/__tests__/__helpers';

export type ProfileAttributes = {
  name: string;
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
    name: 'John Doe'
  };

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

  describe('MemoryDocument.collection', () => {
    it('initializes collection for documents', () => {
      expect(Profile.collection).toEqual({});
    });
  });

  describe('MemoryDocument.create(context, query, mutation)', () => {
    beforeEach(async () => {
      await Profile.reset();
      context.createdDocument = null;
    });

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
      context.createdDocument = createdProfile;

      const profile = await Profile.create(context, attributes);

      expect(profile.id).toEqual(createdProfile.id);
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

    it.skip('throws DocumentNotFoundError if document not found by ID', async () => {
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

  // describe('MemoryDocument.index()', () => {
  //   it('returns documents in batches', () => {
  //   });
  // });

  // describe('MemoryDocument.indexAll()', () => {
  //   it('returns all documents', () => {
  //   });
  // });
});
