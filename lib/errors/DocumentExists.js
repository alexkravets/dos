'use strict'

const OperationError = require('./OperationError')

class DocumentExists extends OperationError {
  constructor(modelName, primaryKey = {}, error) {
    super([ error ])
    this._modelName  = modelName
    this._primaryKey = primaryKey
  }

  static get status() {
    return 'Unprocessable Entity'
  }

  get message() {
    return `${this._modelName} document with primary key ${this._primaryKey}` +
      ' already exits'
  }
}

module.exports = DocumentExists
