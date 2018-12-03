'use strict'

const pick = require('lodash.pick')

class ValidationError extends Error {
  constructor(schemaId, object, validationErrors) {
    super(`${schemaId} object validation has failed`)

    this._object   = object
    this._schemaId = schemaId
    this._validationErrors = validationErrors
  }

  get code() {
    return this.constructor.name
  }

  get schemaId() {
    return this._schemaId
  }

  get object() {
    return this._object
  }

  get validationErrors() {
    return this._validationErrors.map(error => pick(error, [
      'code',
      'message',
      'params',
      'path',
      'schemaId'
    ]))
  }
}

module.exports = ValidationError
