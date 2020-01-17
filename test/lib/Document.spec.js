'use strict'

const Composer    = require('src/Composer')
const Document    = require('src/Document')
const { expect }  = require('chai')
const UserProfile = require('test/example/models/UserProfile')
const OperationContext = require('src/OperationContext')

class CustomUserProfile extends UserProfile {
  static beforeCreate(context, attributes) {
    attributes.beforeCreate = 'beforeCreate'
  }

  static afterCreate(context, customUserProfile) {
    customUserProfile.attributes.afterCreate = 'afterCreate'
  }

  static beforeUpdate(context, query, attributes) {
    attributes.beforeUpdate = 'beforeUpdate'
  }

  static afterUpdate(context, query, attributes, customUserProfile) {
    customUserProfile.attributes.afterUpdate = 'afterUpdate'
  }

  static beforeDelete(context, query) {
    query.beforeDelete = 'beforeDelete'
  }

  static afterDelete(context, query) {
    query.afterDelete = 'afterDelete'
  }
}

const schemasPath = './test/example/schemas'
const components  = [ UserProfile ]
const composer    = new Composer(schemasPath, { components })
const context     = new OperationContext(composer, 'DocumentTest')

describe('Document.documentIdKey', () => {
  it('returns default key for ID', () => {
    expect(UserProfile.documentIdKey).eql('id')
  })
})

describe('Document.defaultIndexSortKey', () => {
  it('returns default sort key for index', () => {
    expect(UserProfile.defaultIndexSortKey).eql('createdAt')
  })
})

describe('Document.schema', () => {
  it('returns extended schema of the document', () => {
    const propertyNames = Object.keys(UserProfile.schema.source)
    expect(propertyNames).to.deep.equal([
      'firstName',
      'lastName',
      'age',
      'gender',
      'id',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy'
    ])
  })
})

describe('Document.bodySchema', () => {
  it('returns schema of the document body', () => {
    const propertyNames = Object.keys(UserProfile.bodySchema.source)
    expect(propertyNames).to.deep.equal([ 'firstName', 'lastName', 'age', 'gender' ])
  })
})

describe('Document.createSchema(schemas)', () => {
  it('returns new schema with common attributes if document schema is not defined', () => {
    class Entity extends Document {}
    const schema = Entity.createSchema([])

    const propertyNames = Object.keys(schema.source)
    expect(propertyNames).to.deep.equal([
      'id',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy'
    ])

  })
})

describe('Document.index(context, query = {}, options = {})', () => {
  it('returns list of document instances', async() => {
    const { objects: userProfiles, count } = await UserProfile.index(context)
    const [ userProfile ] = userProfiles

    expect(userProfile.json).to.include({ firstName: 'Alexander', lastName: 'Kravets' })
    expect(count).to.equal(1)
  })
})

describe('Document.create(context, query, attributes)', () => {
  const query = {}
  const attributes = { firstName: 'Alexander', lastName: 'Kravets', age: 32 }

  it('creates document instance with default values', async() => {
    const userProfile = await UserProfile.create(context, query, attributes)

    expect(userProfile.json).to.include({
      id:        'USER_PROFILE_ID',
      firstName: 'Alexander',
      lastName:  'Kravets',
      age:       32,
      gender:    'Male'
    })

    expect(userProfile.json).to.include.keys([ 'createdAt', 'updatedAt' ])
  })

  it('creates document instance with callbacks', async() => {
    const userId  = 'USER_ID'
    const context = new OperationContext(composer, 'DocumentTest')
    context.set({ userId })

    const userProfile = await CustomUserProfile.create(context, attributes)

    expect(userProfile.json).to.include({
      createdBy:    userId,
      beforeCreate: 'beforeCreate',
      afterCreate:  'afterCreate'
    })
  })
})

describe('Document.read(context, query)', () => {
  it('returns document instance', async() => {
    const userProfile = await UserProfile.read(context, { id: 'USER_PROFILE_ID' })

    expect(userProfile.json).to.include({
      id:        'USER_PROFILE_ID',
      firstName: 'Alexander',
      lastName:  'Kravets'
    })
  })
})

describe('Document.update(context, query, attributes)', () => {
  const attributes = { firstName: 'Stanislav' }

  it('updates document instance', async() => {
    const id = 'USER_PROFILE_ID'
    const userProfile = await UserProfile.update(context, { id }, attributes)

    expect(userProfile.json).to.include({
      id:        'USER_PROFILE_ID',
      firstName: 'Stanislav',
      lastName:  'Kravets'
    })

    expect(userProfile.json).to.include.keys([ 'updatedAt' ])
  })

  it('updates document instance with callbacks', async() => {
    const id      = 'USER_PROFILE_ID'
    const userId  = 'USER_ID'
    const context = new OperationContext(composer, 'DocumentTest')
    context.set({ userId })

    const userProfile = await CustomUserProfile.update(context, { id }, attributes)

    expect(userProfile.json).to.include({
      id:           'USER_PROFILE_ID',
      updatedBy:    userId,
      beforeUpdate: 'beforeUpdate',
      afterUpdate:  'afterUpdate'
    })
  })
})

describe('Document.delete(context, attributes)', () => {
  it('deletes document instance', async() => {
    const query  = { id: 'USER_PROFILE_ID' }
    const result = await UserProfile.delete(context, query)

    expect(result).to.be.undefined
  })

  it('deletes document instance with callbacks', async() => {
    const query = { id: 'USER_PROFILE_ID' }
    await CustomUserProfile.delete(context, query)

    expect(query).to.include({
      beforeDelete: 'beforeDelete',
      afterDelete:  'afterDelete'
    })
  })
})

describe('.update(attributes = {}, shouldMutate = false)', () => {
  it('updates document, returns new document instance', async() => {
    const userProfile = await UserProfile.create(context, {}, {
      id: 'USER_PROFILE_ID_1'
    })

    const updatedDoc = await userProfile.update({ firstName: 'Stanislav' })

    expect(userProfile.attributes.firstName).to.not.exist
    expect(updatedDoc.attributes).to.include({ firstName: 'Stanislav' })
  })

  it('updates document, mutates document instance attributes', async() => {
    const userProfile = await UserProfile.create(context, {}, {
      id: 'USER_PROFILE_ID_2'
    })

    const updatedDoc = await userProfile.update({ firstName: 'Stanislav' }, true)

    expect(userProfile.attributes).to.include({ firstName: 'Stanislav' })
    expect(updatedDoc.attributes).to.include({ firstName: 'Stanislav' })
  })
})

describe('.delete()', () => {
  it('deletes document', async() => {
    const userProfile = await UserProfile.create(context, {}, {
      id: 'USER_PROFILE_ID_3'
    })

    await userProfile.delete()
  })
})
