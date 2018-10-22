'use strict'

const Create      = require('lib/operations/Create')
const { Profile } = require('test/app/models')
const CreateProfileMutation = require('./CreateProfileMutation')
const { Schema, Component } = require('@slatestudio/adept')

class CustomProfile extends Component {
  static get schema() {
    if (this._schema) { return this._schema }

    this._schema = new Schema('CustomProfile', {
      customField: {
        type:     'boolean',
        default:  false,
        required: true
      }
    })

    return this._schema
  }
}

class CreateCustomProfile extends Create {
  static get tags() {
    return [ 'Profiles' ]
  }

  static get resource() {
    return Profile
  }

  static get actionMethodName() {
    return 'createCustomProfile'
  }

  static get mutation() {
    return CreateProfileMutation
  }

  static get output() {
    return CustomProfile
  }
}

module.exports = CreateCustomProfile
