'use strict'

const Delete      = require('lib/operations/Delete')
const { Profile } = require('test/app/models')

class DeleteProfile extends Delete {
  static get tags() {
    return [ 'Profiles' ]
  }

  static get resource() {
    return Profile
  }
}

module.exports = DeleteProfile
