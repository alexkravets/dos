'use strict'

const Composer    = require('lib/Composer')
const { expect }  = require('chai')
const UserProfile = require('test/example/models/UserProfile')

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

describe('Document.index(context, query = {}, options = {})', () => {
  it('returns list of document instances', async() => {
    const { objects: userProfiles, count } = await UserProfile.index()
    const [ userProfile ] = userProfiles

    expect(userProfile.json).to.include({ firstName: 'Alexander', lastName: 'Kravets' })
    expect(count).to.equal(1)
  })
})

describe('Document.create(context, query, attributes)', () => {
  const query = {}
  const attributes = { firstName: 'Alexander', lastName: 'Kravets', age: 32 }

  it('creates document instance with default values', async() => {
    const userProfile = await UserProfile.create({ composer }, query, attributes)

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
    const userId = 'USER_ID'
    const userProfile = await CustomUserProfile.create({ composer, userId }, query, attributes)

    expect(userProfile.json).to.include({
      createdBy:    userId,
      beforeCreate: 'beforeCreate',
      afterCreate:  'afterCreate'
    })
  })
})

describe('Document.read(context, query)', () => {
  it('returns document instance', async() => {
    const userProfile = await UserProfile.read({}, { id: 'USER_PROFILE_ID' })

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
    const userProfile = await UserProfile.update({}, { id }, attributes)

    expect(userProfile.json).to.include({
      id:        'USER_PROFILE_ID',
      firstName: 'Stanislav',
      lastName:  'Kravets'
    })

    expect(userProfile.json).to.include.keys([ 'updatedAt' ])
  })

  it('updates document instance with callbacks', async() => {
    const userId = 'USER_ID'

    const userProfile = await CustomUserProfile.update({ composer, userId }, { userId }, attributes)

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
    const result = await UserProfile.delete({}, query)

    expect(result).to.be.undefined
  })

  it('deletes document instance with callbacks', async() => {
    const query  = { id: 'USER_PROFILE_ID' }
    await CustomUserProfile.delete({}, query)

    expect(query).to.include({
      beforeDelete: 'beforeDelete',
      afterDelete:  'afterDelete'
    })
  })
})

describe('.save(parameters = {})', () => {
  it('updates existing document instance', async() => {
    const userProfile = new UserProfile({}, {
      id: 'USER_PROFILE_ID'
    })

    userProfile.attributes.firstName = 'Stanislav'
    await userProfile.save()

    expect(userProfile.attributes).to.include({ firstName: 'Stanislav' })
  })

  it('creates new document instance', async() => {
    const userId = 'USER_ID'
    const userProfile = new UserProfile({ composer, userId }, {
      firstName: 'Alexander'
    })

    await userProfile.save()

    expect(userProfile.attributes).to.include({ createdBy: userId })
    expect(userProfile.attributes).to.include.keys([ 'id', 'createdAt' ])
  })
})
