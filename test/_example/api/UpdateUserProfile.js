'use strict'

const Update        = require('src/operations/Update')
const UserProfile   = require('../models/UserProfile')
const Authorization = require('../security/Authorization')

class UpdateUserProfile extends Authorization(Update(UserProfile)) {
  static get mutation() {
    return super.mutation.clone({
      only: [ 'firstName', 'lastName' ]
    })
  }
}

module.exports = UpdateUserProfile
