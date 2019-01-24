'use strict'

const Schema    = require('./Schema')
const statuses  = require('statuses')
const Component = require('./Component')

class OperationError extends Component {
  static createSchema() {
    return new Schema(this.id, {
      error: {
        type:     'object',
        required: true,
        properties: {
          code: {
            description: 'Error code',
            type:        'string',
            required:    true
          },
          message: {
            description: 'Error message',
            type:        'string',
            required:    true
          },
          status: {
            description: 'Error status',
            type:        'string',
            required:    true
          },
          statusCode: {
            description: 'Error status code',
            type:        'integer',
            required:    true
          },
          originalError: {
            description: 'Orignal error that cause the exception',
            type:        'object'
          },
          validationErrors: {
            description: 'List of validation errors',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                params: {
                  description: 'Field names of invalid parameters',
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                path: {
                  description: 'Path of invalid parameters',
                  type: 'string'
                },
                schemaId: {
                  description: 'Invalid parameters schema',
                  type: 'string'
                }
              }
            }
          }
        }
      }
    })
  }

  constructor(context, status, error) {
    let { message, code, validationErrors, originalError } = error

    code = code ? code : 'OperationError'

    const statusCode       = statuses(status)
    const isOperationError = statusCode == 500

    super(context, {
      error: {
        code,
        status,
        message,
        statusCode
      }
    })

    if (originalError) {
      this.attributes.error.originalError = originalError
    }

    if (validationErrors) {
      this.attributes.error.validationErrors = validationErrors
    }

    if (isOperationError) {
      this.attributes.error.originalError  = error
      const { operationId, query, userId } = context.all

      console.error('OperationError', {
        code,
        message,
        originalError: error.toJSON ? error.toJSON() : { message: error },
        context: { operationId, query, userId }
      })
    }
  }

  get statusCode() {
    return this.attributes.error.statusCode
  }
}

module.exports = OperationError
