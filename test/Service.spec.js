'use strict'

const Profile       = require('./documents/Profile')
const { expect }    = require('chai')
const { Service }   = require('src')
const CreateProfile = require('./operations/CreateProfile')

describe('Service', () => {
  describe('Service.constructor(components, operations, schemasPath)', () => {
    it('initializes service', () => {
      const components = [ Profile ]
      const operations = [ CreateProfile ]

      const service = new Service(components, operations, 'test/schemas')

      expect(service).to.exist
    })
  })
})
