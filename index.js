'use strict'

const { Schema, Component, Security } = require('@slatestudio/adept')

const aws = {
  Dynamo: require('./lib/aws/dynamo')
}

module.exports = {
  aws,
  Schema,
  Component,
  Security,
  App:            require('./lib/App'),
  Router:         require('./lib/Router'),
  Http:           require('./lib/Http'),
  Serverless:     require('./lib/Serverless'),
  Document:       require('./lib/Document'),
  Operation:      require('./lib/Operation'),
  Create:         require('./lib/operations/Create'),
  Delete:         require('./lib/operations/Delete'),
  Index:          require('./lib/operations/Index'),
  Read:           require('./lib/operations/Read'),
  Update:         require('./lib/operations/Update'),
  OperationError: require('./lib/errors/OperationError')
}
