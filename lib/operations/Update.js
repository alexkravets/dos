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
        schema:      this.reference(this.output)
      }
    }
  }

  async action() {
    const Model = this.constructor.resource
    this.result = await Model.update(this.query, this.mutation)
  }
}

module.exports = Update
