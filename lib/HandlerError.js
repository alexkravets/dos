'use strict'

const { Component, Schema } = require('@slatestudio/adept')

class HandlerError extends Component {
  constructor(error) {
    super()

    this.status = error.status || 'Internal Server Error'

    this.object = {
      code:    error.code || 'INTERNAL_APPLICATION_ERROR',
      message: error.message
    }

    if (error.originalErrors) {
      this.object.originalErrors = error.originalErrors
    }
  }

  static get schema() {
    return new Schema(this.name, {
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
            description: 'Nested errors with additional details',
            type:        'array',
            items:       {
              type: 'object'
            }
          }
        },
        required: [
          'code',
          'message'
        ]
      }
    })
  }
}

module.exports = HandlerError
