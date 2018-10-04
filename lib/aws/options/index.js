'use strict'

const config = require('config')
const options = {}

if (process.env.NODE_ENV !== 'production') {
  const AWS      = require('aws-sdk')
  const profile  = config.get('provider.profile')
  options.region = config.get('provider.region')
  options.credentials = new AWS.SharedIniFileCredentials({ profile })
}

module.exports = options
