'use strict'

const Create      = require('lib/operations/Create')
const UserProfile = require('../models/UserProfile')
const Authorization = require('../security/Authorization')

class CreateUserProfile extends Authorization(Create) {
  static get tags() {
    return [ 'User Profile' ]
  }

  static get resource() {
    return UserProfile
  }
}

module.exports = CreateUserProfile
