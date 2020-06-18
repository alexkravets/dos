'use strict'

const Create           = require('src/operations/Create')
const Profile          = require('test/documents/Profile')
const { publicKey }    = require('src/test/keys')
const JwtAuthorization = require('src/security/JwtAuthorization')

class CreateProfile extends Create(Profile) {
  static get security() {
    return [
      JwtAuthorization.createRequirement(publicKey, 'RS256', payload => {
        const { group } = payload
        return [ 'Administrators' ].includes(group)
      })
    ]
  }
}

module.exports = CreateProfile
