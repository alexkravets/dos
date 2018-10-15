'use strict'

const { expect } = require('chai')
const { UpdateProfile, CreateProfile } = require('test/app/api')[0]

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

  it('should update document by ID', async() => {
    const query    = { id }
    const mutation = { lastName: 'Schmitz' }
    const handler  = new UpdateProfile({ query, mutation })

    const { result } = await handler.exec()
    expect(result.data.attributes).to.include(mutation)
  })
})
