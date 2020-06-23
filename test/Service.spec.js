'use strict'

const Health        = require('test/example/Health')
const { expect }    = require('chai')
const ReadProfile   = require('test/example/ReadProfile')
const CreateProfile = require('test/example/CreateProfile')
const UpdateProfile = require('test/example/UpdateProfile')
const DeleteProfile = require('test/example/DeleteProfile')
const IndexProfiles = require('test/example/IndexProfiles')

const {
  test,
  errors,
  Create,
  Service,
  Component,
} = require('src')

const modules = [
  Health,
  ReadProfile,
  CreateProfile,
  UpdateProfile,
  DeleteProfile,
  IndexProfiles
]

describe('Service', () => {
  before(() => {
    const { Component: Profile } = CreateProfile
    Profile.reset()
  })

  describe('Service.constructor(modules, url, path = \'/src\')', () => {
    it('initializes service', () => {
      const service = new Service(modules, 'https://example.com/api', '/test')
      expect(service).to.exist
    })

    it('throw error if spec validation failed', () => {
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

      const modules = [ InvalidOperation, Health ]
      expect(() => new Service(modules))
        .to.throw('Service spec validation failed')
    })

    it('throw error if schema for component not found', () => {
      class NoSchema extends Component {}
      class NoComponentSchemaOperation extends Create(NoSchema) {}

      const modules = [ NoComponentSchemaOperation ]

      expect(() => new Service(modules))
        .to.throw('Schema for component "NoSchema" not found')
    })
  })

  describe('.handler(request)', () => {
    const service = new Service(modules, 'https://example.com/api/', '/test')
    const exec    = test.execute(service)

    const authorization = test.createAccessToken({}, { group: 'Administrators' })

    it('returns "UnauthorizedError / 401" if missing authorization header', async () => {
      const response = await exec('CreateProfile')

      expect(response.statusCode).to.eql(401)
      expect(response.result.error.code).to.eql('UnauthorizedError')
    })

    it('returns "UnauthorizedError / 401" if invalid authorization header', async () => {
      const cookie   = 'authorization=INVALID_TOKEN; path=/; HttpOnly'
      const response = await exec('CreateProfile', {}, { cookie })

      expect(response.statusCode).to.eql(401)
      expect(response.result.error.code).to.eql('UnauthorizedError')
    })

    it('returns "UnauthorizedError / 401" if token expired', async () => {
      const authorization = test.createAccessToken({ expiresIn: '1 second' })
      await test.wait(1200)

      const response = await exec('CreateProfile', {}, { authorization })

      expect(response.statusCode).to.eql(401)
      expect(response.result.error.code).to.eql('UnauthorizedError')
    })

    it('returns "AccessDeniedError / 403" if operation access denied', async () => {
      const authorization = test.createAccessToken({}, { group: 'Clients' })

      const response = await exec('CreateProfile', {}, { authorization })

      expect(response.statusCode).to.eql(403)
      expect(response.result.error.code).to.eql('AccessDeniedError')
    })

    it('returns "InvalidInputError / 400" if invalid input', async () => {
      const response = await exec('CreateProfile', {}, { authorization })

      expect(response.statusCode).to.eql(400)
      expect(response.result.error.code).to.eql('InvalidInputError')
    })

    it('returns "OperationNotFoundError / 404" if operation not found', async () => {
      const response = await exec('DestroyProfile', {}, { authorization })

      expect(response.statusCode).to.eql(404)
      expect(response.result.error.code).to.eql('OperationNotFoundError')
    })

    it('returns "InvalidParametersError / 422" if invalid parameters', async () => {
      class InvalidIndexProfiles extends IndexProfiles {
        static get errors() {
          return { ...super.errors, InvalidParametersError: { statusCode: 422 } }
        }

        action() {
          throw new errors.InvalidParametersError()
        }
      }

      const modules  = [ InvalidIndexProfiles ]
      const service  = new Service(modules)
      const response = await test.execute(service)('InvalidIndexProfiles')

      expect(response.statusCode).to.eql(422)
      expect(response.result.error.code).to.eql('InvalidParametersError')
    })

    it('returns "InvalidOutputError / 500" if invalid output, logs an error', async () => {
      class InvalidIndexProfiles extends IndexProfiles {
        action() {
          return { invalid: 'RESPONSE' }
        }
      }
      const modules  = [ InvalidIndexProfiles ]
      const service  = new Service(modules)
      const response = await test.execute(service)('InvalidIndexProfiles')

      expect(response.statusCode).to.eql(500)
      expect(response.result.error.code).to.eql('InvalidOutputError')
    })

    it('returns "OperationError / 500" if unexpected operation error, logs an error', async () => {
      class InvalidIndexProfiles extends IndexProfiles {
        action() {
          this.context.authorization = 'SECRET'
          this.context.query = {
            id:       'ID',
            password: 'SECRET',
            nested: {
              token: 'SECRET',
              items: [ 'a1', 'b2', { code: 'SECRET' } ],
            }
          }

          throw new Error('Boom!')
        }
      }
      const modules  = [ InvalidIndexProfiles ]
      const service  = new Service(modules)
      const response = await test.execute(service)('InvalidIndexProfiles')

      expect(response.statusCode).to.eql(500)
      expect(response.result.error.code).to.eql('OperationError')
    })

    it('executes operations', async () => {
      const id = 'HELLO_WORLD'
      let response

      response = await exec('CreateProfile', {
        mutation: { id, name: 'Hello, world!' }
      }, { authorization })

      expect(response.statusCode).to.eql(201)
      expect(response.result.data).to.include({ id, name: 'Hello, world!' })

      response = await exec('UpdateProfile', {
        id, mutation: { name: 'Test update!' }
      }, { authorization })

      expect(response.statusCode).to.eql(200)
      expect(response.result.data).to.include({ name: 'Test update!' })

      response = await exec('IndexProfiles')
      expect(response.statusCode).to.eql(200)
      expect(response.result.data).to.be.not.empty

      response = await exec('DeleteProfile', { id })
      expect(response.statusCode).to.eql(204)
      expect(response.result).to.not.exist
    })

    it('executes operation via HTTP request', async () => {
      const lambdaFunction = request => service.handler(request)

      let request
      let response

      request = {
        url:        'http://localhost:3000/api/Health',
        httpMethod: 'GET'
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(204)

      request = {
        url:        'http://localhost:3000/api/CreateProfile',
        body:       JSON.stringify({ id: 'HELLO_WORLD', name: 'Hello, world!' }),
        headers:    { authorization },
        httpMethod: 'POST'
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(201)

      request = {
        url:    'http://localhost:3000/api/UpdateProfile?id=HELLO_WORLD',
        body:    JSON.stringify({ name: 'HTTP test!' }),
        method:  'PATCH',
        headers: { authorization }
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(200)
    })

    it('supports spec middleware', async () => {
      const lambdaFunction = request => service.handler(request)

      let request
      let response

      request = {
        url:        'http://localhost:3000/',
        httpMethod: 'GET'
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(200)

      request = {
        path:       '/Spec',
        httpMethod: 'GET'
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(200)
    })
  })
})
