'use strict'

const statuses = require('statuses')
const { Component, Schema } = require('@slatestudio/adept')

class OperationError extends Component {
  static get commonSchema() {
    if (this._commonSchema) { return this._commonSchema }

    this._commonSchema = new Schema(this.name, {
      error: {
        type: 'object',
        properties: {
          code: {
            description: 'Error code',
            type:        'string'
          },
          message: {
            description: 'Error message',
            type:        'string'
          },
          originalErrors: {
            description: 'List of additional errors with details',
            type:  'array',
            items: {
              type:       'object',
              properties: {
                code: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                stack: {
                  type: 'string'
                },
                params: {
                  description: 'Invalid parameters field names',
                  type:        'array',
                  items: {
                    type:      'string'
                  }
                },
                path: {
                  description: 'Invalid parameters path within object',
                  type:        'string'
                },
                schemaId: {
                  description: 'Invalid parameters related schema',
                  type:        'string'
                }
              }
            }
          }
        },
        required: [
          'code',
          'message'
        ]
      }
    })

    this._commonSchema.createValidator()

    return this._commonSchema
  }

  static get schema() {
    return this.commonSchema
  }

  static get code() {
    return this.name
  }

  static get status() {
    return 'Internal Server Error'
  }

  static get statusCode() {
    return statuses(this.status)
  }

  constructor(errors) {
    super()

    this._originalErrors = errors

    if (this.code == 'OperationError') {
      const json = JSON.stringify(this.toJSON(), null, 2)
      console.error(json)

    }
  }

  get code() {
    return this.constructor.code
  }

  get status() {
    return this.constructor.status
  }

  get message() {
    return 'Operation unhandled exception'
  }

  toJSON() {
    const json = {
      code:    this.code,
      message: this.message
    }

    if (this._originalErrors) {
      json.originalErrors = this._originalErrors
    }

    return json
  }
}

module.exports = OperationError
