'use strict'

const BaseOperation = require('./BaseOperation')
const toLower = require('lodash.tolower')

class Read extends BaseOperation {
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
