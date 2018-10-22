'use strict'

const OperationError = require('./OperationError')

class InvalidRequestParameters extends OperationError {
  static get status() {
    return 'Bad Request'
  }

  // constructor(validationErrors) {
  //   this.originalErrors = validationErrors
  // }

  get message() {
    return 'Request parameters are invalid'
  }
}

module.exports = InvalidRequestParameters
