'use strict'

const { expect } = require('chai')
const { ReadProfile, CreateProfile, ReadProfileParameters } = require('test/app/api')[1]

let id

describe('Read', () => {
  before(async() => {
    const mutation = {
      firstName:  'Dmitriy',
      lastName:   'Lut',
      parameters: {
        shoeSize:  44,
        shirtSize: 'L'
      }
    }

    const handler = new CreateProfile({ mutation })
    const { result } = await handler.exec()

    id = result.data.id
  })

  describe('.exec()', () => {
    it('returns document by ID', async() => {
      const query   = { id }
      const handler = new ReadProfile({ query })

      const { result } = await handler.exec()

      expect(result.data.id).to.equal(id)
    })

    it('supports `actionMethodName` option', async() => {
      const query   = { id }
      const handler = new ReadProfileParameters({ query })

      const { result } = await handler.exec()

      expect(result.data).to.include({ shoeSize: 44, shirtSize: 'L' })
    })

    it('returns DocumentNotFound error if document not found', async() => {
      const query   = { id: 'DOCUMENT_ID' }
      const handler = new ReadProfile({ query })

      const { result, statusCode } = await handler.exec()

      expect(result).to.have.property('error')
      expect(statusCode).to.equal(404)
      expect(result.error.code).to.equal('DocumentNotFound')
    })
  })
})
