'use strict'

const { expect }    = require('chai')
const { Service }   = require('src')
const CreateProfile = require('./operations/CreateProfile')

describe('Service', () => {
  describe('Service.constructor(modules, path)', () => {
    it('initializes service', () => {
      const modules = [ CreateProfile ]
      const service = new Service(modules, '/test')

      expect(service).to.exist
    })
  })
})
