'use strict'

const CommonError = require('./CommonError')

class InvalidParametersError extends CommonError {
  constructor(message = 'Invalid parameters') {
    super('InvalidParametersError', message)
  }
}

module.exports = InvalidParametersError
