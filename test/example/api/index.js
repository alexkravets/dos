'use strict'

const Health            = require('./Health')
const ReadUserProfile   = require('./ReadUserProfile')
const IndexUserProfiles = require('./IndexUserProfiles')
const CreateUserProfile = require('./CreateUserProfile')
const UpdateUserProfile = require('./UpdateUserProfile')
const DeleteUserProfile = require('./DeleteUserProfile')

const operations = [
  Health,
  ReadUserProfile,
  IndexUserProfiles,
  CreateUserProfile,
  UpdateUserProfile,
  DeleteUserProfile
]

module.exports = operations
