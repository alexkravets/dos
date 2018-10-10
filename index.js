'use strict'

const { Schema, Component, Operation } = require('@slatestudio/adept')

module.exports = {
  aws: {
    dynamo: require('./lib/aws/dynamo')
  },
  server: {
    handler:    require('./lib/server/handler'),
    Http:       require('./lib/server/Http'),
    serverless: require('./lib/server/serverless')
  },
  Schema,
  Component,
  Operation,
  App:          require('./lib/App'),
  Document:     require('./lib/Document'),
  Handler:      require('./lib/Handler'),
  HandlerError: require('./lib/HandlerError'),
  Create:       require('./lib/operations/Create'),
  Delete:       require('./lib/operations/Delete'),
  Index:        require('./lib/operations/Index'),
  Read:         require('./lib/operations/Read'),
  Update:       require('./lib/operations/Update')
}
