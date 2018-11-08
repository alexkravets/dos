'use strict'

const fs      = require('fs')
const config  = require('config')
const homedir = require('os').homedir()

const credentialsPath = `${homedir}/.aws/credentials`
const hasCredentials  = fs.existsSync(credentialsPath)

const connect = () => {
  const AWS     = require('aws-sdk')
  const options = require('../options')

  const isLocal = config.get('dynamodb.isLocal')
  const profile = config.get('provider.profile')

  if (hasCredentials) {
    options.credentials = new AWS.SharedIniFileCredentials({ profile })
  }

  if (isLocal) {
    options.region   = 'local'
    options.endpoint = process.env.DYNAMODB_ENDPOINT || 'http://0.0.0.0:8000'
  }

  const client    = new AWS.DynamoDB.DocumentClient(options)
  const rawClient = new AWS.DynamoDB(options)

  const { service } = config
  const { stage }   = config.provider
  const tablePrefix = `${service}-${stage}`

  return { client, rawClient, tablePrefix }
}

module.exports = connect
