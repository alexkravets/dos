'use strict'

const CommonError = require('./CommonError')

class AccessDeniedError extends CommonError {
  constructor(message = 'Operation access denied') {
    super('AccessDeniedError', message)
  }
}

module.exports = AccessDeniedError
