'use strict'

const { Operation } = require('@slatestudio/adept')
const toLower = require('lodash.tolower')
const Handler = require('../Handler')

class Create extends Handler(Operation) {
  static get summary() {
    return `Create ${toLower(this.resourceName)}`
  }

  static get mutation() {
    return this.resource
  }

  static get responses() {
    return {
      'Created': {
        description: `${this.resourceName} created`,
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
    this.status = this.status || 'Created'

    const Model = this.constructor.resource
    const data  = await Model.create(this.mutation)
    this.result = { data }
  }
}

module.exports = Create
