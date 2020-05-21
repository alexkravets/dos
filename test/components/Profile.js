'use strict'

const { Schema }    = require('@kravc/schema')
const { Component } = require('src')

class Profile extends Component {}

Profile.schema = Schema.loadSync('test/schemas/Profile.yaml')

module.exports = Profile
