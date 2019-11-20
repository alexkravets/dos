'use strict'

const nock        = require('nock')
const jsonRequest = require('lib/helpers/jsonRequest')
const { expect, assert } = require('chai')

const HOST = 'http://json-request.local'

describe('jsonRequest', () => {
  it('uses GET method by default', async() => {
    nock(HOST)
      .get('/IndexEntities')
      .reply(200, [{ name: 'Entity 1' }])

    const url      = `${HOST}/IndexEntities`
    const response = await jsonRequest(console, { url })
    const { object, statusCode } = response

    expect(statusCode).to.equal(200)
    expect(object).to.have.lengthOf(1)
  })

  it('uses POST method if body parameter specified', async() => {
    nock(HOST)
      .post('/CreateEntity')
      .reply(204)

    const url      = `${HOST}/CreateEntity`
    const unit     = { name: 'Entity 2' }
    const response = await jsonRequest(console, { url, body: unit })
    const { object, statusCode } = response

    expect(statusCode).to.equal(204)
    expect(object).to.be.empty
  })

  it('ignores body `null` value, returns empty object if no body returned', async() => {
    nock(HOST)
      .post('/CreateEntity')
      .reply(200, '')

    const url      = `${HOST}/CreateEntity`
    const response = await jsonRequest(console, { url, method: 'post', body: null })
    const { object, statusCode } = response

    expect(statusCode).to.equal(200)
    expect(object).to.be.empty
  })

  it('throws error if server returns non-JSON response', async() => {
    nock('https://json-request.local')
      .get('/ReadEntity')
      .reply(503, 'Service is no available.')

    const options = {
      host:     'json-request.local',
      path:     '/ReadEntity',
      method:   'GET',
      protocol: 'https:'
    }

    try {
      await jsonRequest(console, options)

    } catch (error) {
      expect(error.message).to.include('Respose body is not in a JSON format')
      return

    }

    assert.fail('Expected error has not been thrown.')
  })

  it('throws error if network error after a number of retries, logs failed requests', async() => {
    const url         = 'http://no-response.local/IndexEntities'
    const timeout     = 50
    const headers     = { authorization: 'AUTH_SECRET' }
    const retryDelay  = 100
    const maxAttempts = 2

    try {
      await jsonRequest(console, { url, maxAttempts, retryDelay, timeout, headers })

    } catch (error) {
      expect(error).to.exist
      return
    }

    assert.fail('Expected error has not been thrown.')
  })
})
