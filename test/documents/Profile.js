'use strict'

const Memory       = require('test/storage/Memory')
const { Document } = require('src')

class Profile extends Memory(Document) {
}

module.exports = Profile
