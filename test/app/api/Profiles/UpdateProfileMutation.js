'use strict'

const { Profile }   = require('test/app/models')
const { Component } = require('test/app/lib')

class UpdateProfileMutation extends Component {
  static get schema() {
    return Profile.documentSchema.clone(this.name, { isUpdate: true })
  }
}

module.exports = UpdateProfileMutation
