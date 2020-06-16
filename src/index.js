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
  errors:    require('./errors'),
  test:      require('./test')
}
