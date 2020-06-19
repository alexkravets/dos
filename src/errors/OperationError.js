'use strict'

const path       = require('path')
const logError   = require('../helpers/logError')
const Component  = require('../Component')
const { Schema } = require('@kravc/schema')

const SCHEMA_PATH = path.resolve(__dirname) + '/OperationError.yaml'
const OPERATION_ERROR_SCHEMA = Schema.loadSync(SCHEMA_PATH)

class OperationError extends Component {
  static get schema() {
    return OPERATION_ERROR_SCHEMA
  }

  constructor(context, statusCode, originalError) {
    let { code, message, validationErrors, isCommonError } = originalError

    const shouldLogError = statusCode === 500

    const error = {
      code,
      message,
      statusCode
    }

    if (validationErrors) {
      error.validationErrors = validationErrors
    }

    if (!isCommonError) {
      error.code    = 'OperationError'
      error.message = 'Unexpected operation error'
    }

    super(context, { error })

    if (shouldLogError) {
      logError(context, error, originalError)
    }
  }
}

module.exports = OperationError
