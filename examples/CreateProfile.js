'use strict'

const Create           = require('../src/operations/Create')
const Profile          = require('./Profile')
const { publicKey }    = require('../src/test/keys')
const JwtAuthorization = require('../src/security/JwtAuthorization')

class CreateProfile extends Create(Profile) {
  static get security() {
    const algorithm = 'RS256'

    const accessVerificationMethod = payload => {
      const { group } = payload

      return [ 'Administrators' ].includes(group)
    }

    const tokenVerificationMethod = (...args) => JwtAuthorization.verifyToken(...args)

    return [
      JwtAuthorization.createRequirement({
        publicKey,
        algorithm,
        tokenVerificationMethod,
        accessVerificationMethod
      })
    ]
  }
}

module.exports = CreateProfile
