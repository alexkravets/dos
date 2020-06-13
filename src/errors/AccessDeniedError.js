'use strict'

const CommonError = require('./CommonError')

class AccessDeniedError extends CommonError {
  constructor(message = 'Operation access denied', context) {
    super(
      'AccessDeniedError',
      message,
      context
    )
  }
}

module.exports = AccessDeniedError
