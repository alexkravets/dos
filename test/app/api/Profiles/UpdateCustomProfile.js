'use strict'

const Update      = require('lib/operations/Update')
const { Profile } = require('test/app/models')
const UpdateProfileMutation = require('./UpdateProfileMutation')

class UpdateCustomProfile extends Update {
  static get tags() {
    return [ 'Profiles' ]
  }

  static get resource() {
    return Profile
  }

  static get mutation() {
    return UpdateProfileMutation
  }

  static get actionMethodName() {
    return 'updateCustomProfile'
  }
}

module.exports = UpdateCustomProfile
