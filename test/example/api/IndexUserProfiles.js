'use strict'

const Index       = require('src/operations/Index')
const UserProfile = require('../models/UserProfile')

class IndexUserProfiles extends Index(UserProfile) {
}

module.exports = IndexUserProfiles
