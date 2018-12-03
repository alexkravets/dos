'use strict'

const Operation = require('../Operation')

class Create extends Operation {
  static get resource() {
    throw new Error(`Operation \`${this.id}\` requires \`resource\` to be defined`)
  }

  static get type() {
    return Operation.types.create
  }

  static get errors() {
    return {
      ...super.errors,
      ResourceExists: {
        status: 'Unprocessable Entity'
      }
    }
  }
}

module.exports = Create
