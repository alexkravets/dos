'use strict'

const CommonError = require('./CommonError')

class UnauthorizedError extends CommonError {
  constructor(message) {
    super('UnauthorizedError', message)
  }
}

module.exports = UnauthorizedError
