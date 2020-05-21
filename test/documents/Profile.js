'use strict'

const Memory       = require('../storage/Memory')
const { Schema }   = require('@kravc/schema')
const { Document } = require('src')

class Profile extends Memory(Document) {}

Profile.schema = Schema.loadSync('test/schemas/Profile.yaml')

module.exports = Profile
