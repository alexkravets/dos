'use strict'

const Create      = require('lib/operations/Create')
const { Profile } = require('test/app/models')
const CreateProfileMutation = require('./CreateProfileMutation')

class CreateProfile extends Create {
  static get tags() {
    return [ 'Profiles' ]
  }

  static get resource() {
    return Profile
  }

  static get mutation() {
    return CreateProfileMutation
  }
}

module.exports = CreateProfile
