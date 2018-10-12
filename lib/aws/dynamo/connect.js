'use strict'

const config = require('config')

const connect = () => {
  const AWS     = require('aws-sdk')
  const options = require('../options')

  const isLocal = config.get('dynamodb.isLocal')
  if (isLocal) {
    const profile = config.get('provider.profile')

    options.credentials = new AWS.SharedIniFileCredentials({ profile })
    options.region   = 'local'
    options.endpoint = 'http://0.0.0.0:8000'
  }

  const client    = new AWS.DynamoDB.DocumentClient(options)
  const rawClient = new AWS.DynamoDB(options)

  const { service } = config
  const { stage }   = config.provider
  const tablePrefix = `${service}-${stage}`

  return { client, rawClient, tablePrefix }
}

module.exports = connect
