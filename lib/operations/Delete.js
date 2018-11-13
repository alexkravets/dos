'use strict'

const toLower   = require('lodash.tolower')
const Operation = require('../Operation')

class Delete extends Operation {
  static get type() {
    return this.types.DELETE
  }

  static get summary() {
    return `Delete ${toLower(this.resourceName)} by ID`
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

  static get output() {
    return null
  }

  async action() {
    const Model = this.constructor.resource
    await Model.delete(this.context, this.query)
  }
}

module.exports = Delete
