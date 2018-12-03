'use strict'

const Operation  = require('../Operation')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

class Update extends Operation {
  static get resource() {
    throw new Error(`Operation \`${this.id}\` requires \`resource\` to be defined`)
  }

  static get type() {
    return Operation.types.update
  }

  static get errors() {
    return {
      ...super.errors,
      ResourceNotFound: {
        status: 'Not Found'
      }
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
}

module.exports = Update
