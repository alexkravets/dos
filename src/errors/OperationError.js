'use strict'

const path        = require('path')
const logError    = require('../helpers/logError')
const Component   = require('../Component')
const { Schema }  = require('@kravc/schema')
const maskSecrets = require('../helpers/maskSecrets')

const SCHEMA_PATH = path.resolve(__dirname) + '/OperationError.yaml'
const OPERATION_ERROR_SCHEMA = Schema.loadSync(SCHEMA_PATH)

class OperationError extends Component {
  static get schema() {
    return OPERATION_ERROR_SCHEMA
  }

  constructor(operationContext, statusCode, originalError) {
    let { message, code, validationErrors, context = {} } = originalError

    code = code ? code : 'OperationError'

    const hasContext          = Object.keys(context).length > 0
    const shouldLogError      = statusCode === 500
    const isOperationError    = code === 'OperationError'
    const isInvalidInputError = code === 'InvalidInputError'

    const error = {
      code,
      message,
      statusCode
    }

    if (hasContext) {
      error.context = maskSecrets(context)
    }

    if (isOperationError) {
      error.message = 'Unexpected operation error'
    }

    if (isInvalidInputError) {
      error.validationErrors = validationErrors
    }

    super(operationContext, { error })

    if (shouldLogError) {
      logError(operationContext, { ...error, message }, originalError)
    }
  }
}

module.exports = OperationError
