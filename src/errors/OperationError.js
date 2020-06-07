'use strict'

const path        = require('path')
const logError    = require('../helpers/logError')
const statuses    = require('statuses')
const Component   = require('../Component')
const { Schema }  = require('@kravc/schema')
const maskSecrets = require('../helpers/maskSecrets')

const schemaPath = path.resolve(__dirname) + '/OperationError.yaml'
const operationErrorSchema = Schema.loadSync(schemaPath)

class OperationError extends Component {
  static get schema() {
    return operationErrorSchema
  }

  constructor(operationContext, statusCode, originalError) {
    let { message, code, validationErrors, context = {} } = originalError

    code = code ? code : 'OperationError'

    const status              = statuses[statusCode]
    const hasContext          = Object.keys(context).length > 0
    const shouldLogError      = statusCode === 500
    const isOperationError    = code === 'OperationError'
    const isInvalidInputError = code === 'InvalidInputError'

    const error = {
      message,
      code,
      status,
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

  get statusCode() {
    return this.attributes.error.statusCode
  }
}

module.exports = OperationError
