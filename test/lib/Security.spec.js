'use strict'

const Security = require('lib/Security')
const { expect } = require('chai')

class Authorization extends Security {
  async isAuthorized() {
    const error = new Error('Access denied')
    return { isAuthorized: false, error }
  }
}

describe('Security.authorize({ req }, requirements)', () => {
  it('throws authorization Error if request is not authorized', async() => {
    const req = { headers: {} }
    const requirements = [ { Authorization: { klass: Authorization } } ]

    try {
      await Authorization.authorize({ req }, requirements)

    } catch (error) {
      expect(error).to.have.property('message', 'Access denied')
      return

    }

    throw new Error('Expected exception has not been thrown')
  })
})
