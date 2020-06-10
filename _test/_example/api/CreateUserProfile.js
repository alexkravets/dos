'use strict'

const Create      = require('src/operations/Create')
const UserProfile = require('../models/UserProfile')
const Authorization = require('../security/Authorization')

class CreateUserProfile extends Authorization(Create(UserProfile)) {
  after() {
    this.headers = { 'X-Response-Time': 1 }
  }
}

module.exports = CreateUserProfile
