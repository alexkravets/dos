'use strict'

const { wait, execute, createAccessToken } = require('./test')

module.exports = {
  Document:                    require('./Document'),
  Operation:                   require('./Operation'),
  Service:                     require('./Service'),
  Read:                        require('./operations/Read'),
  Index:                       require('./operations/Index'),
  Create:                      require('./operations/Create'),
  Update:                      require('./operations/Update'),
  Delete:                      require('./operations/Delete'),
  Component:                   require('./Component'),
  handler:                     require('./helpers/handler'),
  getOrFail:                   require('./helpers/getOrFail'),
  security:                    require('./security'),
  verifyToken:                 require('./security/verifyToken'),
  JwtAuthorization:            require('./security/JwtAuthorization'),
  SystemAuthorization:         require('./security/SystemAuthorization'),
  CommonError:                 require('./errors/CommonError'),
  UnauthorizedError:           require('./errors/UnauthorizedError'),
  AccessDeniedError:           require('./errors/AccessDeniedError'),
  DocumentExistsError:         require('./errors/DocumentExistsError'),
  DocumentNotFoundError:       require('./errors/DocumentNotFoundError'),
  InvalidParametersError:      require('./errors/InvalidParametersError'),
  UnprocessibleConditionError: require('./errors/UnprocessibleConditionError'),
  wait,
  execute,
  createAccessToken,
}
