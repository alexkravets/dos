'use strict'

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

describe('.router', () => {
  it('responds to / with Swagger UI', async() => {
    const { body } = await app.router.process({ path: '/', method: 'get' })
    expect(body).to.include('/Spec')
  })

  it('responds to /Spec with Specification', async() => {
    const { body } = await app.router.process({ path: '/Spec', method: 'get' })
    const composerJson = JSON.stringify(app.composer.spec, null, 2)

    expect(body).to.equal(composerJson)
  })

  it('responds to /IndexUserProfiles with data array and meta object', async() => {
    const headers  = { Authorization: 'AUTHORIZATION' }
    const url      = `${host}/IndexUserProfiles?limit=10&sort=asc`
    const { body } = await app.router.process({ path: '/IndexUserProfiles', method: 'get', url, headers })
    const object   = JSON.parse(body)

    expect(object).to.have.property('data')
    expect(object.data).to.have.lengthOf(1)
    expect(object.meta.count).to.equal(1)
  })

  it('responds to /ReadUserProfile with data object', async() => {
    const operationId = 'ReadUserProfile'
    const queryStringParameters = { id: 'USER_PROFILE_ID' }
    const { body } = await app.router.process({ operationId, queryStringParameters })
    const object   = JSON.parse(body)

    expect(object).to.have.property('data')
    expect(object.data).to.include({
      id: 'USER_PROFILE_ID'
    })
  })

  it('responds to /CreateUserProfile with created data object', async() => {
    const operationId = 'CreateUserProfile'
    const json = JSON.stringify({
      firstName: 'Stanislav',
      lastName:  'Kravets'
    })

    const { body } = await app.router.process({ operationId, body: json })
    const object   = JSON.parse(body)

    expect(object).to.have.property('data')
    expect(object.data).to.include({
      id: 'USER_PROFILE_ID',
      firstName: 'Stanislav',
      lastName:  'Kravets',
      gender:    'Male'
    })
  })

  it('responds to /UpdateUserProfile with updated data object', async() => {
    const operationId           = 'UpdateUserProfile'
    const queryStringParameters = { id: 'USER_PROFILE_ID' }
    const json = JSON.stringify({
      firstName: 'Stanislav',
      lastName:  'Kravets'
    })

    const { body } = await app.router.process({ operationId, queryStringParameters, body: json })
    const object   = JSON.parse(body)

    expect(object).to.have.property('data')
    expect(object.data).to.include({
      firstName: 'Stanislav',
      lastName:  'Kravets'
    })
  })

  it('responds to /DeleteUserProfile with no content', async() => {
    const operationId           = 'DeleteUserProfile'
    const queryStringParameters = { id: 'USER_PROFILE_ID' }

    const { statusCode } = await app.router.process({ operationId, queryStringParameters })
    expect(statusCode).to.equal(204)
  })

  it('returns CORS headers for OPTION requests', async() => {
    const url    = `${host}/DeleteUserProfile?id=USER_PROFILE_ID`
    const method = 'options'

    const { headers } = await app.router.process({ url, method, path: '/DeleteUserProfile' })
    expect(headers).to.include.keys([
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Origin'
    ])
  })

  it('returns 404, OperationNotFound if wrong method', async() => {
    const url    = `${host}/DeleteUserProfile?id=USER_PROFILE_ID`
    const method = 'get'

    const { statusCode, body } = await app.router.process({ url, method, path: '/DeleteUserProfile' })
    const object = JSON.parse(body)

    expect(statusCode).to.equal(404)
    expect(object.error.code).to.equal('OperationNotFound')
  })

  it('returns 404, OperationNotFound if wrong path', async() => {
    const url    = `${host}/ActivateUserProfile?id=USER_PROFILE_ID`
    const method = 'patch'

    const { statusCode, body } = await app.router.process({ url, method, path: '/ActivateUserProfile' })
    const object = JSON.parse(body)

    expect(statusCode).to.equal(404)
    expect(object.error).to.include({
      code:       'OperationNotFound',
      status:     'Not Found',
      message:    'Operation not found, route: patch /ActivateUserProfile',
      statusCode: 404
    })
  })

  it('returns 400, InvalidInputError when invalid input provided', async() => {
    const url    = `${host}/CreateUserProfile`
    const method = 'post'
    const json   = JSON.stringify({
      firstName: 'Stanislav'
    })

    const { statusCode, body } = await app.router.process({ url, method, path: '/CreateUserProfile', body: json })
    const object = JSON.parse(body)

    expect(statusCode).to.equal(400)
    expect(object.error).to.include({
      code:       'InvalidInputError',
      status:     'Bad Request',
      message:    'Invalid operation input',
      statusCode: 400
    })
    const [ validationError ] = object.error.validationErrors
    expect(validationError).to.include.keys([ 'code', 'params', 'message', 'path' ])
  })

  it('returns 500, InvalidOutputError and logs error when invalid output returned by operation', async() => {
    const url = `${host}/ReadUserProfile?id=INVALID_OUTPUT`

    const { statusCode, body } = await app.router.process({ url, method: 'get', path: '/ReadUserProfile' })
    const object = JSON.parse(body)

    expect(statusCode).to.equal(500)
    expect(object.error).to.include({
      code:       'InvalidOutputError',
      status:     'Internal Server Error',
      message:    'Invalid operation output',
      statusCode: 500
    })
    const [ validationError ] = object.error.validationErrors
    expect(validationError).to.include.keys([ 'code', 'params', 'message', 'path' ])
  })

  it('returns 500, OperationError and logs error when unhandled exception thrown by operation', async() => {
    const url = `${host}/ReadUserProfile?id=EXCEPTION`

    const { statusCode, body } = await app.router.process({ url, method: 'get', path: '/ReadUserProfile' })
    const object = JSON.parse(body)

    expect(statusCode).to.equal(500)
    expect(object.error).to.include({
      code:       'OperationError',
      status:     'Internal Server Error',
      message:    'Simulated unhandled exception',
      statusCode: 500
    })
    expect(object.error).to.have.property('originalError')
  })
})
