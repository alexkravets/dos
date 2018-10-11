'use strict'

const { Operation } = require('@slatestudio/adept')
const Handler = require('../Handler')
const toLower = require('lodash.tolower')

class Read extends Handler(Operation) {
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

  static get responses() {
    return {
      'OK': {
        description: `Return ${this.resourceName}`,
        schema: {
          type: 'object',
          properties: {
            data: this.reference(this.output)
          },
          required: [ 'data' ]
        }
      }
    }
  }

  static get actionMethod() {
    return null
  }

  async action() {
    const object = await this.Model.read(this.query)

    if (this.constructor.actionMethod) {
      await object[this.constructor.actionMethod]()
    }

    this.result = { data: object }
  }
}

module.exports = Read
