'use strict'

const { Operation } = require('@slatestudio/adept')
const Handler = require('../Handler')
const toLower = require('lodash.tolower')

class Update extends Handler(Operation) {
  static get summary() {
    return `Update ${toLower(this.resourceName)} by ID`
  }

  static get method() {
    if (this.responses.Created) {
      return 'post'
    }

    return 'patch'
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

  static get actionMethodName() {
    return null
  }

  async action() {
    let data

    const Model = this.constructor.resource

    if (this.constructor.actionMethodName) {
      const object = await this.Model.read(this.query)
      data = await object[this.constructor.actionMethodName](this.mutation)

    } else {
      data = await Model.update(this.query, this.mutation)

    }

    this.result = { data }
  }
}

module.exports = Update
