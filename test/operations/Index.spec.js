'use strict'

const { expect } = require('chai')
const { IndexProfiles } = require('test/app/api')[0]

describe('Index', () => {
  it('should return documents', async() => {
    const handler = new IndexProfiles({})
    const { result } = await handler.exec()

    expect(result).to.have.property('data')
  })
})
