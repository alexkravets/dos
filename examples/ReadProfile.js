'use strict'

const Read    = require('../src/operations/Read')
const Profile = require('./Profile')

class ReadProfile extends Read(Profile) {
  static get query() {
    return {
      id: {
        description: 'Profile ID',
        required: true,
        example: 'PRO_1'
      }
    }
  }
}

module.exports = ReadProfile
