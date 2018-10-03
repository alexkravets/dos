'use strict'

const AWS    = require('aws-sdk')
const config = require('config')

const connect = () => {
  const options = require('../options')

  const client    = new AWS.DynamoDB.DocumentClient(options)
  const rawClient = new AWS.DynamoDB(options)

  const { service } = config
  const { stage }   = config.provider
  const tablePrefix = `${service}-${stage}`

  return { client, rawClient, tablePrefix }
}

module.exports = connect
