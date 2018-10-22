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
          }
        },
        required: [
          'code',
          'message'
        ]
      }
    })

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

  constructor(error) {
    super()

    this._error = error

    if (this.code == 'OperationError') {
      console.error(error)

    }
  }

  get code() {
    return this.constructor.code
  }

  get status() {
    return this.constructor.status
  }

  get message() {
    return this._error.message
  }

  toJSON() {
    return {
      code:    this.code,
      message: this.message
    }
  }
}

module.exports = OperationError
