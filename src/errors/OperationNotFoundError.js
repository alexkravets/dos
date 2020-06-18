'use strict'

const CommonError = require('./CommonError')

class OperationNotFoundError extends CommonError {
  constructor() {
    super('OperationNotFoundError', 'Operation not found')
  }
}

module.exports = OperationNotFoundError
