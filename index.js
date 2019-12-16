'use strict'

module.exports = {
  test:        require('./lib/test'),
  App:         require('./lib/App'),
  Schema:      require('./lib/Schema'),
  Document:    require('./lib/Document'),
  Security:    require('./lib/Security'),
  Component:   require('./lib/Component'),
  Operation:   require('./lib/Operation'),
  Read:        require('./lib/operations/Read'),
  Index:       require('./lib/operations/Index'),
  Create:      require('./lib/operations/Create'),
  Update:      require('./lib/operations/Update'),
  Delete:      require('./lib/operations/Delete'),
  httpRequest: require('./lib/helpers/httpRequest'),
  jsonRequest: require('./lib/helpers/jsonRequest')
}
