'use strict'

const { expect } = require('chai')

let app
before(() => {
  app = require('test/example')
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
