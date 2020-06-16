'use strict'

const CommonError = require('./CommonError')

class OperationNotFoundError extends CommonError {
  constructor(context) {
    super('OperationNotFoundError', 'Operation not found', context)
  }
}

module.exports = OperationNotFoundError
