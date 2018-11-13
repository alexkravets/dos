'use strict'

const toLower   = require('lodash.tolower')
const Operation = require('../Operation')

class Read extends Operation {
  static get summary() {
    return `Read ${toLower(this.resourceName)} by ID`
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

  async action() {
    let object = await this.Model.read(this.context, this.query)

    if (this.constructor.actionMethodName) {
      object = await object[this.constructor.actionMethodName](this.context)
    }

    this.result = { data: object }
  }
}

module.exports = Read
