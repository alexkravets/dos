'use strict'

const CommonError = require('./CommonError')

class InvalidParametersError extends CommonError {
  constructor(message = 'Invalid parameters', context) {
    super('InvalidParametersError', message, context)
  }
}

module.exports = InvalidParametersError
