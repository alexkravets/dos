'use strict'

class InvalidRequestParametersError extends Error {
  constructor(originalErrors) {
    super('Request parameters are invalid')

    this.code   = 'INVALID_REQUEST_PARAMETERS'
    this.status = 'Bad Request'
    this.originalErrors = originalErrors
  }
}

module.exports = InvalidRequestParametersError
