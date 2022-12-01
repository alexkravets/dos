'use strict'

const CommonError = require('./CommonError')

class UnprocessibleConditionError extends CommonError {
  constructor(message = 'Invalid parameters') {
    super('UnprocessibleConditionError', message)
  }
}

module.exports = UnprocessibleConditionError
