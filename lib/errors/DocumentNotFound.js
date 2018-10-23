'use strict'

const OperationError = require('./OperationError')

class DocumentNotFound extends OperationError {
  constructor(modelName) {
    super()
    this._modelName = modelName
  }

  static get status() {
    return 'Not Found'
  }

  get message() {
    return `${this._modelName} document is not found`
  }
}

module.exports = DocumentNotFound
