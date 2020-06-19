'use strict'

const CommonError = require('./CommonError')

class UnauthorizedError extends CommonError {
  constructor(message = 'Unauthorized') {
    super('UnauthorizedError', message)
  }
}

module.exports = UnauthorizedError
