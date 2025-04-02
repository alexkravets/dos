'use strict'

module.exports = {
  Document:            require('./Document'),
  Operation:           require('./Operation'),
  Service:             require('./Service'),
  Read:                require('./operations/Read'),
  Index:               require('./operations/Index'),
  Create:              require('./operations/Create'),
  Update:              require('./operations/Update'),
  Delete:              require('./operations/Delete'),
  Component:           require('./Component'),
  errors:              require('./errors'),
  test:                require('./test'),
  handler:             require('./helpers/handler'),
  security:            require('./security'),
  getOrFail:           require('./helpers/getOrFail'),
  verifyToken:         require('./security/verifyToken'),
  JwtAuthorization:    require('./security/JwtAuthorization'),
  SystemAuthorization: require('./security/SystemAuthorization')
}
