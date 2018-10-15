'use strict'

const Read        = require('lib/operations/Read')
const { Profile } = require('test/app/models')

class ReadProfile extends Read {
  static get tags() {
    return [ 'Profiles' ]
  }

  static get resource() {
    return Profile
  }
}

module.exports = ReadProfile
