'use strict'

const { expect }    = require('chai')
const CreateProfile = require('./operations/CreateProfile')
const UpdateProfile = require('./operations/UpdateProfile')
const DeleteProfile = require('./operations/DeleteProfile')
const IndexProfiles = require('./operations/IndexProfiles')
const { Service, Operation } = require('src')

const modules = [ CreateProfile, UpdateProfile, DeleteProfile, IndexProfiles ]

describe('Service', () => {
  describe('Service.constructor(modules, url, path = \'/src\')', () => {
    it('initializes service', () => {
      const service = new Service(modules, 'https://example.com/api', '/test')
      expect(service).to.exist
    })

    it('throw error if spec validation failed', () => {
      class NoParametersOperation extends Operation {}

      class InvalidOperation extends CreateProfile {
        static get query() {
          return {
            id: { type: 'INVALID_TYPE' }
          }
        }

        static get errors() {
          return {
            InvalidParametersError: { statusCode: 422 }
          }
        }
      }

      const modules = [ InvalidOperation, NoParametersOperation ]
      expect(() => new Service(modules))
        .to.throw('Service spec validation failed')
    })
  })

  describe('Service.handler(service, _createContext = createContext)', () => {
  })
})
