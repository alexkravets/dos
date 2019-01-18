'use strict'

const Router     = require('lib/Router')
const { expect } = require('chai')

let app
before(() => {
  app = require('test/example')
})

describe('Router.constructor(basePath, operations, composer)', () => {
  it('leaves basePath as if it not `/` is provided', () => {
    const router = new Router('/test', [], {})
    expect(router._basePath).to.equal('/test')
  })
})

describe('._path(req)', () => {
  it('uses `/` as path if base path matches requested path', () => {
    const router = new Router('/test', [], {})
    expect(router._path({ path: '/test' })).to.equal('/')
  })
})

describe('._method(req)', () => {
  it('support AWS Lambda interface', () => {
    const method = app.router._method({ httpMethod: 'get' })
    expect(method).to.equal('get')
  })
})

describe('._query(req)', () => {
  it('support AWS Lambda interface', () => {
    const query = app.router._query({ queryStringParameters: { limit: 2 } })
    expect(query).to.include({ limit: 2 })
  })
})

describe('.process(req)', () => {
  it('support operation execution by req.operationId', async() => {
    const { statusCode } = await app.router.process({ operationId: 'Health' })
    expect(statusCode).to.equal(200)
  })
})
