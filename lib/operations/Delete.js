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
      }
    }
  }

  async action() {
    const Model = this.constructor.resource
    await Model.delete(this.context, this.query)
  }
}

module.exports = Delete
