'use strict'

const CommonError = require('./CommonError')

class InvalidInputError extends CommonError {
  constructor(validationError, context) {
    super(
      'InvalidInputError',
      'Invalid operation input',
      context)

    this._validationError = validationError
  }

  get validationErrors() {
    return this._validationError.validationErrors
  }
}

module.exports = InvalidInputError
