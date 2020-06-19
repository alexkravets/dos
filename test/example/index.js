'use strict'

// NOTE: Run service example:
// $ npm i --save-dev @kravc/http
// $ ./node_modules/.bin/http ./test/example`

const Health        = require('../operations/Health')
const ReadProfile   = require('../operations/ReadProfile'  )
const CreateProfile = require('../operations/CreateProfile')
const UpdateProfile = require('../operations/UpdateProfile')
const DeleteProfile = require('../operations/DeleteProfile')
const IndexProfiles = require('../operations/IndexProfiles')

const { Service } = require('../../src')

const modules = [
  Health,
  ReadProfile,
  CreateProfile,
  UpdateProfile,
  DeleteProfile,
  IndexProfiles
]

const service = new Service(modules, 'http://localhost:3000/', '/test')

exports.handler = Service.handler(service)
