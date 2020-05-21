'use strict'

const CommonError = require('./CommonError')

class ResourceNotFoundError extends CommonError {
  constructor(resourceName, context) {
    super(
      'ResourceNotFoundError',
      `Resource "${resourceName}" not found`,
      context)
  }
}

module.exports = ResourceNotFoundError
