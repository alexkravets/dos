'use strict'

const getOrFail = require('./getOrFail')
const { expect } = require('chai')

describe('getOrFail(object, path)', () => {
  it('returns requested value', () => {
    const value = getOrFail({ target: 1 }, 'target')
    expect(value).to.exist
  })

  it('throw error if value is undefined', () => {
    expect(
      () => getOrFail({}, 'target')
    ).to.throw('Value is undefined for "target"')
  })
})
