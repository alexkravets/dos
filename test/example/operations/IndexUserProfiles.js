'use strict'

const Index       = require('lib/operations/Index')
const UserProfile = require('../models/UserProfile')

class IndexUserProfiles extends Index {
  static get tags() {
    return [ 'User Profile' ]
  }

  static get resource() {
    return UserProfile
  }
}

module.exports = IndexUserProfiles
