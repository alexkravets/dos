'use strict'

const Read          = require('lib/operations/Read')
const { Profile }   = require('test/app/models')
const { Component } = require('test/app/lib')

class ProfileParameters extends Component {
}

class ReadProfileParameters extends Read {
  static get tags() {
    return [ 'Profiles' ]
  }

  static get resource() {
    return Profile
  }

  static get output() {
    return ProfileParameters
  }

  static get actionMethodName() {
    return 'parameters'
  }
}

module.exports = ReadProfileParameters
