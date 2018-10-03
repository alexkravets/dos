'use strict'

module.exports = {
  aws: {
    dynamo: require('./lib/aws/dynamo')
  },
  server: {
    Http:       require('./lib/server/Http'),
    lambda:     require('./lib/server/lambda'),
    serverless: require('./lib/server/serverless')
  },
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
