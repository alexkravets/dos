'use strict'

const Composer   = require('src/Composer')
const { expect } = require('chai')
const OperationContext = require('src/OperationContext')

const composer = new Composer(null, { operations: [], config: {} })
const context  = new OperationContext(composer, 'TestContext')

context.set({ a: 'A', b: 'B' })

describe('._get(key)', () => {
  it('throws error if value is missing in the context', () => {
    expect(() => context._get('exception')).to
      .throw('Operation "TestContext" context is missing value for key "exception"')
  })
})

describe('.get(keys)', () => {
  it('returns value for a string key', () => {
    expect(context.get('a')).to.equal('A')
  })

  it('returns array of values for array of keys', () => {
    expect(context.get([ 'a', 'b' ])).to.deep.equal([ 'A', 'B' ])
  })
})
