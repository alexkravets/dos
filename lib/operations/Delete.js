'use strict'

const { Operation } = require('@slatestudio/adept')
const toLower = require('lodash.tolower')
const Handler = require('../Handler')

class Delete extends Handler(Operation) {
  static get summary() {
    return `Delete ${toLower(this.resourceName)} by ID`
  }

  static get method() {
    return 'delete'
  }

  static get query() {
    return {
      id: {
        description: `${this.resourceName} ID`,
        type:        'string',
        required:    true
      }
    }
  }

  static get responses() {
    return {
      'No Content': {
        description: `${this.resourceName} deleted`
      },
      'Not Found': {
        description: `${this.resourceName} is not found`,
        schema:      this.operationError
      }
    }
  }

  async action() {
    const Model = this.constructor.resource
    this.result = await Model.delete(this.query)
  }
}

module.exports = Delete
