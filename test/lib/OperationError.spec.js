'use strict'

const OperationError = require('lib/OperationError')
const { expect } = require('chai')

describe('.statusCode', () => {
  it('returns error status code', () => {
    const error = new OperationError({}, 'Not Found', { message: 'Resource not found' })
    expect(error.statusCode).to.equal(404)
  })
})
