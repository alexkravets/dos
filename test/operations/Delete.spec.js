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

  it('should delete document', async() => {
    const query   = { id }
    const handler = new DeleteProfile({ query })

    const { statusCode } = await handler.exec()
    expect(statusCode).to.equal(204)
  })
})
