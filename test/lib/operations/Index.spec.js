'use strict'

const { expect } = require('chai')
const { IndexProfiles } = require('test/app/api')[0]

describe('Index', () => {
  describe('.exec()', () => {
    it('returns documents index', async() => {
      const handler = new IndexProfiles({})
      const { result } = await handler.exec()

      expect(result).to.have.property('data')
    })
  })
})
