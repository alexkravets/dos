'use strict'

const Create  = require('src/operations/Create')
const Profile = require('test/documents/Profile')
// const Authorization = require('../security/Authorization')

class CreateProfile extends Create(Profile) {
}

module.exports = CreateProfile
