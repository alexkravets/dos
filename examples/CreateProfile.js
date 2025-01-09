'use strict'

const Create           = require('../src/operations/Create')
const Profile          = require('./Profile')
const verifyToken      = require('../src/security/verifyToken')
const { publicKey }    = require('../src/test/keys')
const JwtAuthorization = require('../src/security/JwtAuthorization')

class CreateProfile extends Create(Profile) {
  static get tags() {
    return [
      'Profiles',
      'profiles-write',
      'System'
    ]
  }

  static get security() {
    const algorithm = 'RS256'

    const accessVerificationMethod = (context, { group }) => {
      const isAccessGranted = [ 'Administrators' ].includes(group)

      return [ isAccessGranted, 'Access denied' ]
    }

    const tokenVerificationMethod = (...args) => verifyToken(...args)

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
