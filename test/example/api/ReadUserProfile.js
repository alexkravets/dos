'use strict'

const Read        = require('lib/operations/Read')
const UserProfile = require('../models/UserProfile')

class ReadUserProfile extends Read(UserProfile) {
}

module.exports = ReadUserProfile
