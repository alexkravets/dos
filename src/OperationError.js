'use strict'

const pick        = require('lodash.pick')
const Schema      = require('./Schema')
const statuses    = require('statuses')
const Component   = require('./Component')
const maskSecrets = require('./helpers/maskSecrets')

const OPERATION_CONTEXT_FIELDS = [
  'requestReceivedAt',
  'requestId',
  'userId',
  'operationId',
  'query',
  'mutation'
]

class OperationError extends Component {
  static createSchema() {
    return new Schema(this.id, {
      error: {
        type:     'object',
        required: true,
        properties: {
          message: {
            description: 'Error message',
            type:        'string',
            required:    true
          },
          code: {
            description: 'Error code',
            type:        'string',
            required:    true
          },
          context: {
            description: 'Error context object',
            type:        'object'
          },
          status: {
            description: 'HTTP error status',
            type:        'string',
            required:    true
          },
          statusCode: {
            description: 'HTTP error status code',
            type:        'integer',
            required:    true
          },
          validationErrors: {
            description: 'Validation errors',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message: {
                  type: 'string'
                },
                schemaId: {
                  description: 'Schema ID',
                  type: 'string'
                },
                path: {
                  description: 'Path of invalid attribute',
                  type: 'string'
                },
                code: {
                  description: 'Code of z-schema validation error',
                  type: 'string'
                },
                params: {
                  description: 'Invalid attribute values',
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  constructor(operationContext, status, originalError) {
    let { message, code, validationErrors, context = {} } = originalError

    code = code ? code : 'OperationError'

    const statusCode          = statuses(status)
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
      const operationError = { ...error, message }

      operationError.operationContext = maskSecrets(
        pick(operationContext.all, OPERATION_CONTEXT_FIELDS)
      )

      const log = [ 'OperationError', operationError ]

      if (originalError.toJSON) {
        operationError.originalErrorJson = JSON.stringify(originalError, null, 2)

      } else {
        log.push(originalError)

      }

      console.error(...log)
    }
  }

  get statusCode() {
    return this.attributes.error.statusCode
  }
}

module.exports = OperationError
