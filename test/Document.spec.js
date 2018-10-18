'use strict'

const { expect }  = require('chai')
const { Profile } = require('test/app/models')

describe('Document', () => {

  before(() => Profile.createCollection())
  after(() => Profile.deleteCollection())

  describe('Document.create(context, attributes)', () => {
    it('uses default values specified in documentSchema', async() => {
      const object = await Profile.create({}, { name: 'Alexander' })
      expect(object.attributes).to.include({ isActive: false })
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
})
