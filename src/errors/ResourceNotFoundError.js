'use strict'

const CommonError = require('./CommonError')

class ResourceNotFoundError extends CommonError {
  constructor(resourceName) {
    super('ResourceNotFoundError', `Resource "${resourceName}" not found`)
  }
}

module.exports = ResourceNotFoundError
