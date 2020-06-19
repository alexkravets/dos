'use strict'

const CommonError = require('./CommonError')

class OperationNotFoundError extends CommonError {
  constructor(parameters) {
    const parametersJson = JSON.stringify(parameters, null, 2)
    super('OperationNotFoundError', `Operation not found, ${parametersJson}`)
  }

  get statusCode() {
    return 404
  }
}

module.exports = OperationNotFoundError
