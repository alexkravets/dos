'use strict'

const Update           = require('../../src/operations/Update')
const Profile          = require('./Profile')
const { publicKey }    = require('../../src/test/keys')
const JwtAuthorization = require('../../src/security/JwtAuthorization')

class UpdateProfile extends Update(Profile) {
  static get security() {
    return [ JwtAuthorization.createRequirement(publicKey) ]
  }
}

module.exports = UpdateProfile
