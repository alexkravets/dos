'use strict'

const { Document } = require('test/app/lib')
const Dynamo       = require('lib/aws/dynamo')

class Profile extends Dynamo(Document) {
  async createCustomProfile() {
    return { custom: true }
  }
}

module.exports = Profile
