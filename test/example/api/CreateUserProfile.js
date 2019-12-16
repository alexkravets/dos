'use strict'

const Create      = require('lib/operations/Create')
const UserProfile = require('../models/UserProfile')
const Authorization = require('../security/Authorization')

class CreateUserProfile extends Authorization(Create(UserProfile)) {
}

module.exports = CreateUserProfile
