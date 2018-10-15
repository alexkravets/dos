'use strict'

const Index       = require('lib/operations/Index')
const { Profile } = require('test/app/models')

class IndexProfiles extends Index {
  static get tags() {
    return [ 'Profiles' ]
  }

  static get resource() {
    return Profile
  }
}

module.exports = IndexProfiles
