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
        schema:      this.reference(this.output)
      }
    }
  }

  async action() {
    this.status = this.status || 'Created'

    const Model = this.constructor.resource
    this.result = await Model.create(this.mutation)
  }
}

module.exports = Create
