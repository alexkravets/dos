'use strict'

const { Component, Schema } = require('@slatestudio/adept')
const statuses = require('statuses')

class HandlerError extends Component {
  constructor(error) {
    super()
    this.error = error
  }

  static get schema() {
    return new Schema(this.name, {
      status: {
        description: 'HTTP error status',
        type:        'string',
        required:    true
      },
      statusCode: {
        description: 'HTTP error status code',
        type:        'string',
        required:    true
      },
      name: {
        description: 'Error name',
        type:        'string',
        required:    true
      },
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
      originalError: {
        description: 'Original error object that might contain more error details',
        type:        'object'
      }
    })
  }

  get status() {
    return this.error.status || 'Internal Server Error'
  }

  get statusCode() {
    return statuses(this.status)
  }

  get code() {
    return this.error.code || 'INTERNAL_APPLICATION_ERROR'
  }

  get originalError() {
    return this.error.originalError
  }

  toObject() {
    const object = {
      status:        this.status,
      statusCode:    this.statusCode,
      code:          this.code,
      message:       this.error.message,
      originalError: this.error.originalError
    }

    if (!object.originalError) { delete object.originalError }

    return object
  }
}

module.exports = HandlerError
