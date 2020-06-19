'use strict'

const CommonError = require('./CommonError')

class InvalidInputError extends CommonError {
  constructor(validationError) {
    super('InvalidInputError', 'Invalid operation input')

    const { validationErrors } = validationError.toJSON()

    this._validationErrors = validationErrors
  }

  get validationErrors() {
    return this._validationErrors
  }
}

module.exports = InvalidInputError
