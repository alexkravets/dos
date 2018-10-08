'use strict'

const { Operation } = require('@slatestudio/adept')
const Handler = require('../Handler')
const toLower = require('lodash.tolower')

class Update extends Handler(Operation) {
  static get summary() {
    return `Update ${toLower(this.resourceName)} by ID`
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
        description: `${this.resourceName} updated`,
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

  async action() {
    const Model = this.constructor.resource
    const data  = await Model.update(this.query, this.mutation)
    this.result = { data }
  }
}

module.exports = Update
