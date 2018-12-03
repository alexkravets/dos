'use strict'

const Http = require('lib/Http')
const { expect } = require('chai')

describe('Http.error()', () => {
  it('returns { statusCode, body } response with error', () => {
    const { statusCode, body } = Http.error('Bad Request', 'ErrorCode', 'Error message')
    const { error } = JSON.parse(body)

    expect(statusCode).to.equal(400)
    expect(error).to.include({
      code:       'ErrorCode',
      status:     'Bad Request',
      message:    'Error message',
      statusCode: 400
    })
  })
})
