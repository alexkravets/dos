'use strict'

const { Document } = require('test/app/lib')
const Dynamo       = require('lib/aws/dynamo')

class Profile extends Dynamo(Document) {
  static async createCustomProfile() {
    return { customField: true }
  }

  async parameters() {
    return this._attributes.parameters
  }

  async updateCustomProfile(mutation) {
    await this.save({ type: 'custom', ...mutation })
    return this
  }
}

module.exports = Profile
