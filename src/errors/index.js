'use strict'

module.exports = {
  CommonError:            require('./CommonError'),
  UnauthorizedError:      require('./UnauthorizedError'),
  AccessDeniedError:      require('./AccessDeniedError'),
  ResourceNotFoundError:  require('./ResourceNotFoundError'),
  InvalidParametersError: require('./InvalidParametersError')
}
