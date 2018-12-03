'use strict'

const Spec              = require('test/example/operations/Spec')
const ReadUserProfile   = require('test/example/operations/ReadUserProfile')
const IndexUserProfiles = require('test/example/operations/IndexUserProfiles')
const CreateUserProfile = require('test/example/operations/CreateUserProfile')
const UpdateUserProfile = require('test/example/operations/UpdateUserProfile')
const DeleteUserProfile = require('test/example/operations/DeleteUserProfile')

const operations = [
  Spec,
  ReadUserProfile,
  IndexUserProfiles,
  CreateUserProfile,
  UpdateUserProfile,
  DeleteUserProfile
]

module.exports = operations
