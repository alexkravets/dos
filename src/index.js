'use strict'

module.exports = {
  Service:   require('./Service'),
  Document:  require('./Document'),
  Component: require('./Component'),
  Operation: require('./Operation'),
  Read:      require('./operations/Read'),
  Index:     require('./operations/Index'),
  Create:    require('./operations/Create'),
  Update:    require('./operations/Update'),
  Delete:    require('./operations/Delete'),
  // test:           require('./src/test'),
  // App:            require('./src/App'),
  // Document:       require('./src/Document'),
  // Security:       require('./src/Security'),
  // Operation:      require('./src/Operation'),
  // httpRequest:    require('./src/helpers/httpRequest'),
  // jsonRequest:    require('./src/helpers/jsonRequest'),
  // CommonError:    require('./src/helpers/CommonError'),
  // OperationError: require('./src/OperationError')
}
