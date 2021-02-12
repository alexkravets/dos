'use strict'

const Update           = require('../src/operations/Update')
const Profile          = require('./Profile')
const { publicKey }    = require('../src/test/keys')
const JwtAuthorization = require('../src/security/JwtAuthorization')
const SystemAuthorization = require('../src/security/SystemAuthorization')

class UpdateProfile extends Update(Profile) {
  static get security() {
    return [
      SystemAuthorization.createRequirement(),
      JwtAuthorization.createRequirement({ publicKey })
    ]
  }
}

module.exports = UpdateProfile
