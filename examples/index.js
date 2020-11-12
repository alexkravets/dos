'use strict'

// NOTE: Run service example:
// $ npm i --save-dev @kravc/http
// $ ./node_modules/.bin/http ./test/example`

const Health        = require('./Health')
const ReadProfile   = require('./ReadProfile'  )
const CreateProfile = require('./CreateProfile')
const UpdateProfile = require('./UpdateProfile')
const DeleteProfile = require('./DeleteProfile')
const IndexProfiles = require('./IndexProfiles')

const { Service, handler } = require('../src')

const modules = [
  Health,
  ReadProfile,
  CreateProfile,
  UpdateProfile,
  DeleteProfile,
  IndexProfiles
]

const service = new Service(modules, 'http://localhost:3000/', '/examples')

exports.handler = handler(service)
