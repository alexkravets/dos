'use strict'

const { expect }    = require('chai')
const CreateProfile = require('test/operations/CreateProfile')
const UpdateProfile = require('test/operations/UpdateProfile')
const DeleteProfile = require('test/operations/DeleteProfile')
const IndexProfiles = require('test/operations/IndexProfiles')
const createAccessToken = require('test/helpers/createAccessToken')
const { Service, Operation, test } = require('src')

const { execute } = test

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
    const service = new Service(modules, 'https://example.com/api', '/test')
    const exec = execute(service)

    const authorization = createAccessToken({}, { group: 'Administrators' })

    it('returns "UnauthorizedError / 401" if missing authorization header', async () => {
      const response = await exec('CreateProfile')

      expect(response.statusCode).to.eql(401)
      expect(response.body).to.include('UnauthorizedError')
    })

    it('returns "UnauthorizedError / 401" if invalid authorization header', async () => {
      const authorization = ''
      const response = await exec('CreateProfile', {}, { authorization })

      expect(response.statusCode).to.eql(401)
      expect(response.body).to.include('UnauthorizedError')
    })

    it('returns "AccessDeniedError / 403" if operation access denied', async () => {
      const authorization = createAccessToken({}, { group: 'Clients' })

      const response = await exec('CreateProfile', {}, { authorization })

      expect(response.statusCode).to.eql(403)
      expect(response.body).to.include('AccessDeniedError')
    })

    it('returns "InvalidInputError / 400" if invalid input', async () => {
      const response = await exec('CreateProfile', {}, { authorization })

      expect(response.statusCode).to.eql(400)
      expect(response.body).to.include('InvalidInputError')
    })
  })
})
