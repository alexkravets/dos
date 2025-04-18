'use strict'

const { Schema } = require('@kravc/schema')

const Health        = require('examples/Health')
const { expect }    = require('chai')
const ReadProfile   = require('examples/ReadProfile')
const CreateProfile = require('examples/CreateProfile')
const UpdateProfile = require('examples/UpdateProfile')
const DeleteProfile = require('examples/DeleteProfile')
const IndexProfiles = require('examples/IndexProfiles')

const test = require('src/test')
const {
  errors,
  Create,
  Service,
  Component,
} = require('src')

const testSchema = new Schema({
  test: {
    type: 'string'
  }
}, 'Test')

const modules = [
  testSchema,
  Health,
  ReadProfile,
  CreateProfile,
  UpdateProfile,
  DeleteProfile,
  IndexProfiles
]

const ROOT_PATH = process.cwd()

describe('Service', () => {
  before(() => {
    const { Component: Profile } = CreateProfile
    Profile.reset()
  })

  describe('Service.constructor(modules, url, path = \'/src\')', () => {
    it('initializes service', () => {
      const service = new Service(modules, {
        url: 'https://example.com/api',
        path: `${ROOT_PATH}/examples`
      })

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
    const service = new Service(modules, {
      url: 'https://example.com/api/',
      path: `${ROOT_PATH}/examples`
    })

    const { exec, request: executeRequest, expectError } = test.execute(service)

    const authorization = test.createAccessToken({}, { group: 'Administrators' })

    it('returns "UnauthorizedError / 401" if missing authorization header', async () => {
      const error = await expectError('CreateProfile', {}, {}, 'UnauthorizedError')
      expect(error.statusCode).to.eql(401)

      // NOTE: Additional tests for execute helpers to get code coverage.
      try {
        await executeRequest('CreateProfile', {}, {})
        throw new Error('Expected error was not thrown')
      } catch (error) {
        expect(error.message).to.include('RequestError for "CreateProfile"')
      }

      try {
        await expectError('CreateProfile', {}, {}, 'AccessDeniedError')
        throw new Error('Expected error was not thrown')
      } catch (error) {
        expect(error.message).to.include('Unexpected error code received')
      }
    })

    it('returns "UnauthorizedError / 401" if invalid authorization header', async () => {
      const cookie   = 'authorization=INVALID_TOKEN; path=/; HttpOnly'
      const error = await expectError('CreateProfile', {}, { cookie }, 'UnauthorizedError')

      expect(error.statusCode).to.eql(401)
    })

    it('returns "UnauthorizedError / 401" if token expired', async () => {
      const authorization = test.createAccessToken({ expiresIn: '1 second' })
      await test.wait(1200)

      const error = await expectError('CreateProfile', {}, { authorization }, 'UnauthorizedError')

      expect(error.statusCode).to.eql(401)
    })

    it('returns "AccessDeniedError / 403" if operation access denied', async () => {
      const authorization = test.createAccessToken({}, { group: 'Clients' })
      const error = await expectError('CreateProfile', {}, { authorization }, 'AccessDeniedError')

      expect(error.statusCode).to.eql(403)
    })

    it('returns "InvalidInputError / 400" if invalid input', async () => {
      const error = await expectError('CreateProfile', {}, { authorization }, 'InvalidInputError')

      expect(error.statusCode).to.eql(400)
    })

    it('returns "InvalidParametersError / 400" if invalid parameters', async () => {
      class InvalidIndexProfiles extends IndexProfiles {
        action() {
          throw new errors.InvalidParametersError()
        }
      }

      const modules  = [ InvalidIndexProfiles ]
      const service  = new Service(modules)
      const { expectError: customExpectError } = test.execute(service)
      const error = await customExpectError('InvalidIndexProfiles', {}, {}, 'InvalidParametersError')

      expect(error.statusCode).to.eql(400)
    })

    it('returns "OperationNotFoundError / 404" if operation not found', async () => {
      const error = await expectError('DestroyProfile', {}, { authorization }, 'OperationNotFoundError')

      expect(error.statusCode).to.eql(404)
    })

    it('returns "UnprocessibleConditionError / 422" if unprocessible condition', async () => {
      class InvalidIndexProfiles extends IndexProfiles {
        action() {
          throw new errors.UnprocessibleConditionError()
        }
      }

      const modules  = [ InvalidIndexProfiles ]
      const service  = new Service(modules)
      const { expectError: customExpectError } = test.execute(service)
      const error = await customExpectError('InvalidIndexProfiles', {}, {}, 'UnprocessibleConditionError')

      expect(error.statusCode).to.eql(422)
    })

    it('returns "InvalidOutputError / 500" if invalid output, logs an error', async () => {
      class InvalidIndexProfiles extends IndexProfiles {
        action() {
          return { invalid: 'RESPONSE' }
        }
      }
      const modules  = [ InvalidIndexProfiles ]
      const service  = new Service(modules)
      const { expectError: customExpectError } = test.execute(service)
      const error = await customExpectError('InvalidIndexProfiles', {}, {}, 'InvalidOutputError')

      expect(error.statusCode).to.eql(500)
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
      const { expectError: customExpectError } = test.execute(service)
      const error = await customExpectError('InvalidIndexProfiles', {}, {}, 'OperationError')

      expect(error.statusCode).to.eql(500)
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

      const data = await executeRequest('UpdateProfile', {
        id, mutation: { name: 'System operation request!' }
      }, {})

      expect(data).to.include({ name: 'System operation request!' })

      // NOTE: Additional tests for execute helpers to get code coverage.
      try {
        await expectError('UpdateProfile', {
          id, mutation: { name: 'System operation request!' }
        }, {}, 'AccessDeniedError')
        throw new Error('Expected error was not thrown')
      } catch (error) {
        expect(error.message).to.include('Success NOT expected for')
      }

      response = await exec('IndexProfiles')
      expect(response.statusCode).to.eql(200)
      expect(response.result.data).to.be.not.empty

      response = await exec('DeleteProfile', { id })
      expect(response.statusCode).to.eql(204)
      expect(response.result).to.not.exist

      await executeRequest('CreateProfile', {
        mutation: { id, name: 'Hello, world!' }
      }, { authorization })

      await executeRequest('DeleteProfile', { id })
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

    it('supports spec middleware in dev environment', async () => {
      process.env.NODE_APP_INSTANCE = 'dev'

      const lambdaFunction = request => service.handler(request)

      let request
      let response

      request = {
        url:        'http://localhost:3000/',
        httpMethod: 'GET'
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(200)
      expect(response.body.startsWith('<!DOCTYPE')).to.be.true

      request = {
        path:       '/Spec',
        httpMethod: 'GET'
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(200)

      const body = JSON.parse(response.body)
      expect(body.swagger).to.exist

      response = await lambdaFunction({ path: '/Documents.yaml', httpMethod: 'GET' })
      response = await lambdaFunction({ path: '/Enums.yaml', httpMethod: 'GET' })
      response = await lambdaFunction({ path: '/Operations.yaml', httpMethod: 'GET' })
      response = await lambdaFunction({ path: '/Parameters.yaml', httpMethod: 'GET' })
      response = await lambdaFunction({ path: '/Schenarios.yaml', httpMethod: 'GET' })
      response = await lambdaFunction({ path: '/Schemas.yaml', httpMethod: 'GET' })
      expect(response.statusCode).to.eql(200)

      process.env.NODE_APP_INSTANCE = undefined
    })

    it('does not expose spec middleware in non-dev environment', async () => {
      const lambdaFunction = request => service.handler(request)

      let request
      let response

      request = {
        url:        'http://localhost:3000/',
        httpMethod: 'GET'
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(200)
      expect(response.body).to.eql('healthy')

      request = {
        path:       '/Spec',
        httpMethod: 'GET'
      }

      response = await lambdaFunction(request)
      expect(response.statusCode).to.eql(200)

      const body = JSON.parse(response.body)
      expect(body.swagger).to.not.exist
    })

    it('logs operation input in non-test environment', async () => {
      process.env.NODE_APP_INSTANCE = 'dev'

      const lambdaFunction = request => service.handler(request)

      await lambdaFunction({
        url: 'http://localhost:3000/api/Health',
        httpMethod: 'GET'
      })

      const id = 'HELLO_WORLD'
      await exec('CreateProfile', {
        mutation: { id, name: 'Hello, world!' }
      }, { authorization })

      process.env.NODE_APP_INSTANCE = undefined
    })
  })
})
