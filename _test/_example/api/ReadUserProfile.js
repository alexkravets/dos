'use strict'

const Read        = require('src/operations/Read')
const UserProfile = require('../models/UserProfile')

class ReadUserProfile extends Read(UserProfile) {
}

module.exports = ReadUserProfile
