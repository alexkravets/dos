'use strict'

module.exports = {
  CommonError:            require('./CommonError'),
  UnauthorizedError:      require('./UnauthorizedError'),
  AccessDeniedError:      require('./AccessDeniedError'),
  DocumentExistsError:    require('./DocumentExistsError'),
  DocumentNotFoundError:  require('./DocumentNotFoundError'),
  InvalidParametersError: require('./InvalidParametersError')
}
