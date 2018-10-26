'use strict'

const { expect } = require('chai')
const { CreateProfile, CreateCustomProfile } = require('test/app/api')[1]

describe('Create', () => {
  describe('.exec()', () => {
    it('creates and return new document', async() => {
      const mutation = {
        firstName: 'Alexander',
        lastName:  'Kravets'
      }

      const handler = new CreateProfile({ mutation })
      const { result } = await handler.exec()

      expect(result.data).to.include(mutation)
    })

    it('supports `actionMethodName` option', async() => {
      const mutation = {
        firstName: 'Alexander',
        lastName:  'Kravets'
      }

      const handler = new CreateCustomProfile({ mutation })
      const { result } = await handler.exec()

      expect(result.data.customField).to.be.true
    })

    it('returns InvalidRequestParameters error if parameters validation failed ', async() => {
      const handler = new CreateProfile({})

      const { result, statusCode } = await handler.exec()

      expect(result).to.have.property('error')
      expect(statusCode).to.equal(400)
      expect(result.error.code).to.equal('InvalidRequestParameters')
      expect(result.error.originalErrors[0].message).to.equal('Missing required property: mutation')
    })
  })
})
