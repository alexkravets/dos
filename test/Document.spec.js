'use strict'

const { expect }  = require('chai')
const { Profile } = require('test/app/models')

describe('Document', () => {

  before(async() => await Profile.createCollection())
  after(async() => await Profile.deleteCollection())

  describe('Document.create(context, attributes)', () => {

    it('should use documentSchema as prototype for the new document', async() => {
      const object = await Profile.create({}, { name: 'Alexander' })
      expect(object.attributes).to.include({ isActive: false })
    })

  })
})
