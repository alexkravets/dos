'use strict'

const Document    = require('lib/Document')
const Dynamo      = require('lib/aws/dynamo')
const { expect }  = require('chai')
const { Profile } = require('test/app/models')

const expectError = async(fn, errorName) => {
  try {
    await fn()

  } catch (error) {
    expect(error.code).to.equal(errorName)
    return

  }

  throw new Error(`Expected error ${errorName} was not thrown`)
}

describe('Document', () => {
  const buffer = []
  const log = message => buffer.push(message)

  class CustomProfile extends Dynamo(Document) {
    static get documentSchema() {
      return Profile.documentSchema
    }

    static async beforeCreate(context, attributes) {
      attributes.sex = 'Male'
    }

    static async afterCreate(context, object) {
      object._attributes.type = 'Custom'
    }

    static async beforeUpdate(context, query, attributes) {
      attributes.tags = [ 'Updated' ]
    }

    static async afterUpdate(context, query, attributes, object) {
      object._attributes.type = 'Custom'
    }

    static async beforeDelete(context, query) {
      log(`Start delete: ${query}`)
    }

    static async afterDelete(context, query) {
      log(`End delete: ${query}`)
    }
  }

  before(async() => {
    await Profile.createCollection()
    await CustomProfile.createCollection()
  })

  after(async() => {
    await Profile.deleteCollection()
    await CustomProfile.deleteCollection()
  })

  describe('Document.commonSchema', () => {
    it('returns Common schema instance', () => {
      expect(Profile.commonSchema).to.exist
    })
  })

  describe('Document.documentSchema', () => {
    it('returns document schema based on class name', () => {
      expect(Profile.documentSchema).to.exist
    })

    it('throws an error if schema is not defined', () => {
      class NoSchema extends Document {}

      expect(() => NoSchema.documentSchema).to.throw('NoSchema schema is not found')
    })
  })

  describe('Document.schema', () => {
    it('returns document schema merged with common schema', () => {
      expect(Profile.schema).to.exist
    })

    it('returns document schema only if common schema is not defined', () => {
      class NoCommon extends Document {
        static get documentSchema() {
          return Profile.documentSchema
        }
      }

      expect(NoCommon.schema).to.exist
    })
  })

  describe('Document.create(context, attributes)', () => {
    it('uses default values specified in documentSchema', async() => {
      const object = await Profile.create({}, { firstName: 'Alexander' })
      expect(object.attributes).to.include({ isActive: false })
    })

    it('sets createdBy if userId is defined in context', async() => {
      const object = await Profile.create({ userId: 'USER_ID' }, { firstName: 'Alexander' })
      expect(object.attributes).to.include({ createdBy: 'USER_ID' })
    })

    it('supports beforeCreate and afterCreate methods', async() => {
      const object = await CustomProfile.create({}, { firstName: 'Alexander' })
      expect(object.attributes).to.include({ sex: 'Male', type: 'Custom' })
    })
  })

  describe('Document.index(context, query)', () => {
    it('returns list of documents', async() => {
      const { objects } = await Profile.index({})
      expect(objects).to.have.lengthOf(2)
    })
  })

  describe('Document.read(context, query)', () => {
    let profileId

    before(async() => {
      const profile = await Profile.create({}, { firstName: 'Alexander', lastName: 'Kravets' })
      profileId = profile.id
    })

    it('returns document by ID', async() => {
      const profile = await Profile.read({}, { id: profileId })
      expect(profile.id).to.equal(profileId)
    })

    it.skip('returns first document using query with default sort order', async() => {
      const profile = await Profile.read({}, { firstName: 'Alexander' })
      expect(profile).to.exist
    })
  })

  describe('Document.update(context, query, attributes)', () => {
    let profileId
    let customProfileId

    before(async() => {
      const profile = await Profile.create({}, { firstName: 'Alexander' })
      profileId = profile.id

      const customProfile = await CustomProfile.create({}, { firstName: 'Alexander' })
      customProfileId = customProfile.id
    })

    it('updates document', async() => {
      await Profile.update({}, { id: profileId }, { lastName: 'Kravets' })
      const profile = await Profile.read({}, { id: profileId })
      expect(profile.attributes).to.include({ firstName: 'Alexander', lastName: 'Kravets' })
    })

    it('supports beforeUpdate and afterUpdate methods', async() => {
      const object = await CustomProfile.update({}, { id: customProfileId }, { lastName: 'Kravets' })
      expect(object.attributes).to.include({ type: 'Custom', lastName: 'Kravets' })
      expect(object.attributes.tags[0]).to.equal('Updated')
    })

    it('sets updatedBy if userId is defined in context', async() => {
      const object = await Profile.update({ userId: 'USER_ID' }, { id: profileId}, { firstName: 'Sasha' })
      expect(object.attributes).to.include({ updatedBy: 'USER_ID' })
    })

    it.skip('updates first document using query with default sort order', async() => {
      await Profile.update({}, { firstName: 'Alexander' }, { firstName: 'Yu Min' })
      const profile = await Profile.read({}, { firstName: 'Yu Min' })
      expect(profile).to.exist
    })
  })

  describe('Document.delete(context, query)', () => {
    let profileId
    let customProfileId

    before(async() => {
      const profile = await Profile.create({}, { firstName: 'Olga' })
      profileId = profile.id

      const customProfile = await CustomProfile.create({}, { firstName: 'Olga' })
      customProfileId = customProfile.id
    })

    it('updates document', async() => {
      await Profile.delete({}, { id: profileId })
      await expectError(() => Profile.read({}, { id: profileId }), 'DocumentNotFound')
    })

    it('supports beforeUpdate and afterUpdate methods', async() => {
      await CustomProfile.delete({}, { id: customProfileId })
      expect(buffer).to.have.lengthOf(2)
    })
  })

  describe('.save(parameters = {})', () => {
    it('creates a new document', async() => {
      let object = new Profile()
      expect(object.id).to.not.exist

      await object.save({ firstName: 'Stas' })

      expect(object.attributes).to.include({ firstName: 'Stas' })
      expect(object.id).to.exist

      object = await Profile.read({}, { id: object.id })
      expect(object.attributes).to.include({ firstName: 'Stas' })
    })

    it('updates an existing document', async() => {
      let object = await Profile.create({}, { name: 'Alexander' })
      object._attributes.lastName = 'Kravets'

      await object.save()

      object = await Profile.read({}, { id: object.id })
      expect(object.attributes).to.include({ lastName: 'Kravets' })
    })

    it('updates an existing document with specific parameters', async() => {
      let object = await Profile.create({}, { name: 'Alexander' })

      await object.save({ lastName: 'Kravets' })
      expect(object.attributes).to.include({ lastName: 'Kravets' })

      object = await Profile.read({}, { id: object.id })
      expect(object.attributes).to.include({ lastName: 'Kravets' })
    })
  })

  describe('.toJSON()', () => {
    it('returns document attributes', () => {
      const attributes = { firstName: 'Alexander' }
      const profile = new Profile({}, attributes)

      expect(profile.toJSON()).to.include(attributes)
    })
  })
})
