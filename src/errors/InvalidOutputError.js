'use strict'

const CommonError = require('./CommonError')

class InvalidOutputError extends CommonError {
  constructor(invalidObject, validationError) {
    super('InvalidOutputError', 'Invalid operation output')

    this._validationError = validationError
  }

  toJSON() {
    return {
      ...this._validationError.toJSON(),
      object: '[MASKED]'
    }
  }
}

module.exports = InvalidOutputError
