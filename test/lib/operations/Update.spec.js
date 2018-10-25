'use strict'

const { expect } = require('chai')
const { UpdateProfile, CreateProfile, UpdateCustomProfile } = require('test/app/api')[0]

let id

describe('Update', () => {
  before(async() => {
    const mutation = {
      firstName: 'Garry',
      lastName:  'Schmits'
    }

    const handler = new CreateProfile({ mutation })
    const { result } = await handler.exec()

    id = result.data.id
  })

  describe('.exec()', () => {
    it('updates document by ID', async() => {
      const query    = { id }
      const mutation = { lastName: 'Schmitz' }
      const handler  = new UpdateProfile({ query, mutation })

      const { result } = await handler.exec()
      expect(result.data).to.include(mutation)
    })

    it('supports `actionMethodName` option', async() => {
      const query    = { id }
      const mutation = { lastName: 'Kravets' }

      const handler = new UpdateCustomProfile({ query, mutation })
      const { result } = await handler.exec()

      expect(result.data).to.include({ type: 'custom', ...mutation })
    })

    it('returns DocumentNotFound error if document not found', async() => {
      const query    = { id: 'DOCUMENT_ID' }
      const mutation = { lastName: 'Schmitz' }
      const handler  = new UpdateProfile({ query, mutation })

      const { result, statusCode } = await handler.exec()

      expect(result).to.have.property('error')
      expect(statusCode).to.equal(404)
      expect(result.error.code).to.equal('DocumentNotFound')
    })

    it('returns InvalidRequestParameters error if parameters validation failed ', async() => {
      const query   = { id: 'DOCUMENT_ID' }
      const handler = new UpdateProfile({ query })

      const { result, statusCode } = await handler.exec()

      expect(result).to.have.property('error')
      expect(statusCode).to.equal(400)
      expect(result.error.code).to.equal('InvalidRequestParameters')
      expect(result.error.originalErrors[0].message).to.equal('Missing required property: mutation')
    })
  })
})
