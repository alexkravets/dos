'use strict'

const { expect } = require('chai')
const { ReadProfile, CreateProfile } = require('test/app/api')[0]

let id

describe('Read', () => {
  before(async() => {
    const mutation = {
      firstName: 'Dmitriy',
      lastName:  'Lut'
    }

    const handler = new CreateProfile({ mutation })
    const { result } = await handler.exec()

    id = result.data.id
  })

  it('should return document by ID', async() => {
    const query   = { id }
    const handler = new ReadProfile({ query })

    const { result } = await handler.exec()
    expect(result.data.id).to.equal(id)
  })
})
