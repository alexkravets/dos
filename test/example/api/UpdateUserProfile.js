'use strict'

const Update      = require('lib/operations/Update')
const UserProfile = require('../models/UserProfile')
const Authorization = require('../security/Authorization')

class UpdateUserProfile extends Authorization(Update) {
  static get tags() {
    return [ 'User Profile' ]
  }

  static get resource() {
    return UserProfile
  }

  static get mutation() {
    return this.cloneMutationSchema(UserProfile, {
      only: [ 'firstName', 'lastName' ]
    })
  }
}

module.exports = UpdateUserProfile
