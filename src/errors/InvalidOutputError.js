'use strict'

const CommonError = require('./CommonError')

class InvalidOutputError extends CommonError {
  constructor(invalidObject, validationError) {
    super('InvalidOutputError', 'Invalid operation output')

    this._invalidObject   = JSON.parse(JSON.stringify(invalidObject))
    this._validationError = validationError
  }

  toJSON() {
    return {
      ...this._validationError.toJSON(),
      object: this._invalidObject
    }
  }
}

module.exports = InvalidOutputError
