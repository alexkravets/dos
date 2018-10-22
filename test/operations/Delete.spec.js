'use strict'

const { expect } = require('chai')
const { DeleteProfile, CreateProfile } = require('test/app/api')[0]

let id

describe('Delete', () => {
  before(async() => {
    const mutation = {
      firstName: 'Andriy',
      lastName:  'Luzhniy'
    }

    const handler = new CreateProfile({ mutation })
    const { result } = await handler.exec()

    id = result.data.id
  })

  describe('.exec()', () => {
    it('deletes document by ID', async() => {
      const query   = { id }
      const handler = new DeleteProfile({ query })

      const { result } = await handler.exec()
      expect(result).to.be.undefined
    })

    it('returns DocumentNotFound error if document not found', async() => {
      const query   = { id: 'DOCUMENT_ID' }
      const handler = new DeleteProfile({ query })

      const { result, statusCode } = await handler.exec()

      expect(result).to.have.property('error')
      expect(statusCode).to.equal(404)
      expect(result.error.code).to.equal('DocumentNotFound')
    })
  })
})
