'use strict'

const ReadUserProfile   = require('./ReadUserProfile')
const IndexUserProfiles = require('./IndexUserProfiles')
const CreateUserProfile = require('./CreateUserProfile')
const UpdateUserProfile = require('./UpdateUserProfile')
const DeleteUserProfile = require('./DeleteUserProfile')

const operations = [
  ReadUserProfile,
  IndexUserProfiles,
  CreateUserProfile,
  UpdateUserProfile,
  DeleteUserProfile
]

module.exports = operations
