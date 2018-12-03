'use strict'

const { expect } = require('chai')
const { jsonRequest, httpRequest } = require('@slatestudio/common-client')

const host = 'http://localhost:3000'

let app
before(() => {
  app = require('test/example')
})

describe('.serverless', () => {
  it('returns serverless configuration', () => {
    expect(app.serverless).to.have.property('provider')
  })
})

describe('.operationsMap', () => {
  it('returns operations map', () => {
    expect(app.operationsMap).to.exist
  })
})

describe('.start()', () => {
  it('starts HTTP server', async() => {
    await app.start()
  })

  it('responds to / with Swagger UI', async() => {
    const url = `${host}`
    const { body } = await httpRequest({ url })

    expect(body).to.include('/Spec')
  })

  it('responds to /Spec with Specification', async() => {
    const url = `${host}/Spec`
    const { object: spec } = await jsonRequest({ url })

    const responseJson = JSON.stringify(spec)
    const composerJson = JSON.stringify(app.composer.spec)

    expect(responseJson).to.equal(composerJson)
  })

  it('responds to /IndexUserProfiles with data array and meta object', async() => {
    const url = `${host}/IndexUserProfiles?limit=10&sort=asc`
    const { object } = await jsonRequest({ url })

    expect(object).to.have.property('data')
    expect(object.data).to.have.lengthOf(1)
    expect(object.meta.count).to.equal(1)
  })

  it('responds to /ReadUserProfile with data object', async() => {
    const url = `${host}/ReadUserProfile?id=USER_PROFILE_ID`
    const { object } = await jsonRequest({ url })

    expect(object).to.have.property('data')
    expect(object.data).to.include({
      id: 'USER_PROFILE_ID'
    })
  })

  it('responds to /CreateUserProfile with created data object', async() => {
    const url    = `${host}/CreateUserProfile`
    const method = 'post'
    const body   = {
      firstName: 'Stanislav',
      lastName:  'Kravets'
    }

    const { object } = await jsonRequest({ url, body, method })

    expect(object).to.have.property('data')
    expect(object.data).to.include({
      id: 'USER_PROFILE_ID',
      firstName: 'Stanislav',
      lastName:  'Kravets',
      gender:    'Male'
    })
  })

  it('responds to /UpdateUserProfile with updated data object', async() => {
    const url    = `${host}/UpdateUserProfile?id=USER_PROFILE_ID`
    const method = 'patch'
    const body   = {
      firstName: 'Stanislav',
      lastName:  'Kravets'
    }

    const { object } = await jsonRequest({ url, body, method })

    expect(object).to.have.property('data')
    expect(object.data).to.include({
      firstName: 'Stanislav',
      lastName:  'Kravets'
    })
  })

  it('responds to /DeleteUserProfile', async() => {
    const url    = `${host}/DeleteUserProfile?id=USER_PROFILE_ID`
    const method = 'delete'

    const response = await jsonRequest({ url, method })
    expect(response.statusCode).to.equal(204)
  })

  it('responds with CORS headers to OPTION requests', async() => {
    const url    = `${host}/DeleteUserProfile?id=USER_PROFILE_ID`
    const method = 'options'

    const { headers } = await jsonRequest({ url, method })
    expect(headers).to.include.keys([
      'access-control-allow-headers',
      'access-control-allow-methods',
      'access-control-allow-origin'
    ])
  })

  it('responds with 404 if wrong method', async() => {
    const url    = `${host}/DeleteUserProfile?id=USER_PROFILE_ID`
    const method = 'get'

    try {
      await jsonRequest({ url, method })

    } catch (error) {
      expect(error.response.statusCode).to.equal(404)
      return

    }

    throw new Error('Expected exception has not been thrown')
  })

  it('responds with 404 if wrong path', async() => {
    const url    = `${host}/ActivateUserProfile?id=USER_PROFILE_ID`
    const method = 'patch'

    try {
      await jsonRequest({ url, method })

    } catch (error) {
      expect(error.response.statusCode).to.equal(404)
      expect(error.response.object.error).to.include({
        code:       'OperationNotFound',
        status:     'Not Found',
        message:    'Operation not found, route: patch /ActivateUserProfile',
        statusCode: 404
      })

      return
    }

    throw new Error('Expected exception has not been thrown')
  })

  it('responds with InvalidInputError when invalid input provided', async() => {
    const url    = `${host}/CreateUserProfile`
    const method = 'post'
    const body   = {
      firstName: 'Stanislav'
    }

    try {
      await jsonRequest({ url, body, method })

    } catch (error) {
      expect(error.response.statusCode).to.equal(400)
      expect(error.response.object.error).to.include({
        code:       'InvalidInputError',
        status:     'Bad Request',
        message:    'Invalid operation input',
        statusCode: 400
      })
      const [ validationError ] = error.response.object.error.validationErrors
      expect(validationError).to.include.keys([ 'code', 'params', 'message', 'path' ])

      return
    }

    throw new Error('Expected exception has not been thrown')
  })

  it('responds with InvalidOutputError when invalid output returned by operation', async() => {
    const url = `${host}/ReadUserProfile?id=INVALID_OUTPUT`

    try {
      await jsonRequest({ url })

    } catch (error) {
      expect(error.response.statusCode).to.equal(500)
      expect(error.response.object.error).to.include({
        code:       'InvalidOutputError',
        status:     'Internal Server Error',
        message:    'Invalid operation output',
        statusCode: 500
      })
      const [ validationError ] = error.response.object.error.validationErrors
      expect(validationError).to.include.keys([ 'code', 'params', 'message', 'path' ])

      return
    }

    throw new Error('Expected exception has not been thrown')
  })

  it('responds with OperationError when unhandled exception thrown by operation', async() => {
    const url = `${host}/ReadUserProfile?id=EXCEPTION`

    try {
      await jsonRequest({ url })

    } catch (error) {
      expect(error.response.statusCode).to.equal(500)

      expect(error.response.object.error).to.include({
        code:       'OperationError',
        status:     'Internal Server Error',
        message:    'Unhandled exception',
        statusCode: 500
      })
      expect(error.response.object.error).to.have.property('originalError')

      return
    }

    throw new Error('Expected exception has not been thrown')
  })
})
