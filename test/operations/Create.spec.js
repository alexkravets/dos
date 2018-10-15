'use strict'

const { expect } = require('chai')
const { CreateProfile } = require('test/app/api')[0]

describe('Create', () => {
  it('should create and return new document', async() => {
    const mutation = {
      firstName: 'Alexander',
      lastName:  'Kravets'
    }

    const handler = new CreateProfile({ mutation })
    const { result } = await handler.exec()

    expect(result.data.attributes).to.include(mutation)
  })
})
