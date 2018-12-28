'use strict'

const Delete      = require('lib/operations/Delete')
const UserProfile = require('../models/UserProfile')
const Authorization = require('../security/Authorization')

class DeleteUserProfile extends Authorization(Delete) {
  static get tags() {
    return [ 'User Profile' ]
  }

  static get resource() {
    return UserProfile
  }
}

module.exports = DeleteUserProfile
