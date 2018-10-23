'use strict'

const OperationError = require('./OperationError')

class InvalidRequestParameters extends OperationError {
  static get status() {
    return 'Bad Request'
  }

  get message() {
    return 'Invalid request parameters'
  }
}

module.exports = InvalidRequestParameters
