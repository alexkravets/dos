'use strict'

module.exports = {
  test:        require('./lib/test'),
  App:         require('./lib/App'),
  Schema:      require('./lib/Schema'),
  Component:   require('./lib/Component'),
  Document:    require('./lib/Document'),
  Security:    require('./lib/Security'),
  Operation:   require('./lib/Operation'),
  Read:        require('./lib/operations/Read'),
  Index:       require('./lib/operations/Index'),
  Create:      require('./lib/operations/Create'),
  Update:      require('./lib/operations/Update'),
  Delete:      require('./lib/operations/Delete'),
  httpRequest: require('./lib/helpers/httpRequest'),
  jsonRequest: require('./lib/helpers/jsonRequest'),
  createOperation: require('./lib/helpers/createOperation')
}
