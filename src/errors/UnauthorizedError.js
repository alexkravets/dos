'use strict'

const CommonError = require('./CommonError')

class UnauthorizedError extends CommonError {
  constructor(message = 'Unauthorized', context) {
    super(
      'UnauthorizedError',
      message,
      context
    )
  }
}

module.exports = UnauthorizedError
