'use strict'

const UserProfile = require('../models/UserProfile')
const createOperation = require('lib/helpers/createOperation')

class IndexUserProfiles extends createOperation('Index', UserProfile) {
}

module.exports = IndexUserProfiles
