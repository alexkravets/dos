'use strict'

const CommonError = require('./CommonError')

class InvalidOutputError extends CommonError {
  constructor(invalidObject, validationError) {
    super(
      'InvalidOutputError',
      'Invalid operation output')

    this._invalidObject   = JSON.parse(JSON.stringify(invalidObject))
    this._validationError = validationError
  }

  toJSON() {
    return {
      code:             this._validationError.code,
      message:          this._validationError.message,
      invalidObject:    this._invalidObject,
      validationErrors: this._validationError.validationErrors
    }
  }
}

module.exports = InvalidOutputError
