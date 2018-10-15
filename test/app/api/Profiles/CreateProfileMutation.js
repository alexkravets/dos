'use strict'

const { Profile }   = require('test/app/models')
const { Component } = require('test/app/lib')

class CreateProfileMutation extends Component {
  static get schema() {
    return Profile.documentSchema.clone(this.name)
  }
}

module.exports = CreateProfileMutation
