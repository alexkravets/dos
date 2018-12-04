'use strict'

const Operation  = require('../Operation')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

class Delete extends Operation {
  static get resource() {
    throw new Error(`Operation \`${this.id}\` requires \`resource\` to be defined`)
  }

  static get type() {
    return Operation.types.delete
  }

  static get errors() {
    return {
      ...super.errors,
      ResourceNotFoundError: { status: 'Not Found' }
    }
  }

  static get query() {
    const documentName = capitalize(startCase(this.resource.name))

    return {
      id: {
        description: `${documentName} ID`,
        type:        'string',
        required:    true
      }
    }
  }

  static get outputSchema() {
    return null
  }
}

module.exports = Delete
