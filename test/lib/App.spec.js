'use strict'

const App        = require('lib/App')
const { expect } = require('chai')

const host = 'http://localhost:3000'

let app
before(() => {
  app = require('test/example')
})

describe('.operationsMap', () => {
  it('returns operations map', () => {
    expect(app.operationsMap).to.exist
  })
})

describe('._path(req)', () => {
  it('uses `/` as path if base path matches requested path', () => {
    const config = {
      spec: { basePath: '/test' }
    }

    const app = new App(null, { components: [], operations: [], config })
    expect(app._path({ path: '/test' })).to.equal('/')
  })
})

describe('._method(req)', () => {
  it('supports AWS Lambda interface', () => {
    const method = app._method({ httpMethod: 'get' })
    expect(method).to.equal('get')
  })
})

describe('.process(req)', () => {
  it('supports operation execution by req.operationId', async() => {
    const { statusCode } = await app.process({ operationId: 'Health' })
    expect(statusCode).to.equal(200)
  })

  it('responds to / with Swagger UI', async() => {
    const { result } = await app.process({ path: '/', method: 'get' })
    expect(result).to.include('/Spec')
  })

  it('responds to /Spec with Specification', async() => {
    const { result } = await app.process({ path: '/Spec', method: 'get' })
    const resultJson   = JSON.stringify(result, null, 2)
    const composerJson = JSON.stringify(app.spec, null, 2)

    expect(resultJson).to.equal(composerJson)
  })

  it('responds to /Heartbeat with "No Content" status', async() => {
    const { statusCode } = await app.process({ path: '/Heartbeat', method: 'get' })

    expect(statusCode).to.equal(204)
  })

  it('responds to /IndexUserProfiles with data array and meta object', async() => {
    const headers    = { Authorization: 'AUTHORIZATION' }
    const url        = `${host}/IndexUserProfiles?limit=10&sort=asc`
    const { result } = await app.process({ path: '/IndexUserProfiles', method: 'get', url, headers })

    expect(result).to.have.property('data')
    expect(result.data).to.have.lengthOf(1)
    expect(result.meta.count).to.equal(1)
  })

  it('responds to /ReadUserProfile with data', async() => {
    const operationId = 'ReadUserProfile'
    const queryStringParameters = { id: 'USER_PROFILE_ID' }
    const { result } = await app.process({ operationId, queryStringParameters })

    expect(result).to.have.property('data')
    expect(result.data).to.include({
      id: 'USER_PROFILE_ID'
    })
  })

  it('responds to /CreateUserProfile with created data', async() => {
    const operationId = 'CreateUserProfile'
    const body = JSON.stringify({
      firstName: 'Stanislav',
      lastName:  'Kravets'
    })

    const { result } = await app.process({ operationId, body })

    expect(result).to.have.property('data')
    expect(result.data).to.include({
      id: 'USER_PROFILE_ID',
      firstName: 'Stanislav',
      lastName:  'Kravets',
      gender:    'Male'
    })
  })

  it('responds to /UpdateUserProfile with updated data', async() => {
    const operationId           = 'UpdateUserProfile'
    const queryStringParameters = { id: 'USER_PROFILE_ID' }
    const body = {
      firstName: 'Stanislav',
      lastName:  'Kravets'
    }

    const { result } = await app.process({ operationId, queryStringParameters, body })

    expect(result).to.have.property('data')
    expect(result.data).to.include({
      firstName: 'Stanislav',
      lastName:  'Kravets'
    })
  })

  it('responds to /DeleteUserProfile with no content', async() => {
    const operationId           = 'DeleteUserProfile'
    const queryStringParameters = { id: 'USER_PROFILE_ID' }

    const { statusCode } = await app.process({ operationId, queryStringParameters })
    expect(statusCode).to.equal(204)
  })

  it('returns 404, OperationNotFound if wrong method', async() => {
    const url    = `${host}/DeleteUserProfile?id=USER_PROFILE_ID`
    const method = 'get'

    const { statusCode, result } = await app.process({ url, method, path: '/DeleteUserProfile' })

    expect(statusCode).to.equal(404)
    expect(result.error.code).to.equal('OperationNotFound')
  })

  it('returns 404, OperationNotFound if wrong path', async() => {
    const url    = `${host}/ActivateUserProfile?id=USER_PROFILE_ID`
    const method = 'patch'

    const { statusCode, result } = await app.process({ url, method, path: '/ActivateUserProfile' })

    expect(statusCode).to.equal(404)
    expect(result.error).to.include({
      code:       'OperationNotFound',
      status:     'Not Found',
      message:    'Operation not found, route: patch /ActivateUserProfile',
      statusCode: 404
    })
  })

  it('returns 400, InvalidInputError when invalid input provided', async() => {
    const url    = `${host}/CreateUserProfile`
    const method = 'post'
    const body   = JSON.stringify({
      firstName: 'Stanislav'
    })

    const { statusCode, result } = await app.process({ url, method, path: '/CreateUserProfile', body })

    expect(statusCode).to.equal(400)
    expect(result.error).to.include({
      code:       'InvalidInputError',
      status:     'Bad Request',
      message:    'Invalid operation input',
      statusCode: 400
    })
    const [ validationError ] = result.error.validationErrors
    expect(validationError).to.include.keys([ 'code', 'params', 'message', 'path' ])
  })

  it('returns 500, InvalidOutputError and logs error when invalid output returned by operation', async() => {
    const url = `${host}/ReadUserProfile?id=INVALID_OUTPUT`

    const { statusCode, result } = await app.process({ url, method: 'get', path: '/ReadUserProfile' })

    expect(statusCode).to.equal(500)
    expect(result.error).to.include({
      code:       'InvalidOutputError',
      status:     'Internal Server Error',
      message:    'Invalid operation output',
      statusCode: 500
    })
    const [ validationError ] = result.error.validationErrors
    expect(validationError).to.include.keys([ 'code', 'params', 'message', 'path' ])
  })

  it('returns 500, OperationError and logs error when unhandled exception thrown by operation', async() => {
    const url = `${host}/ReadUserProfile?id=EXCEPTION`

    const { statusCode, result } = await app.process({ url, method: 'get', path: '/ReadUserProfile' })

    expect(statusCode).to.equal(500)
    expect(result.error).to.include({
      code:       'OperationError',
      status:     'Internal Server Error',
      message:    'Simulated unhandled exception',
      statusCode: 500
    })
    expect(result.error).to.have.property('originalError')
  })
})
