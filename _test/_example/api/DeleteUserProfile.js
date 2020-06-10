'use strict'

const Delete      = require('src/operations/Delete')
const UserProfile = require('../models/UserProfile')
const Authorization = require('../security/Authorization')

class DeleteUserProfile extends Authorization(Delete(UserProfile)) {
}

module.exports = DeleteUserProfile
