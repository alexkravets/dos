'use strict'

const Read        = require('lib/operations/Read')
const UserProfile = require('../models/UserProfile')

class ReadUserProfile extends Read {
  static get tags() {
    return [ 'User Profile' ]
  }

  static get resource() {
    return UserProfile
  }
}

module.exports = ReadUserProfile
