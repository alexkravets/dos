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
        schema: this.reference(this.output)
      }
    }
  }

  async action() {
    this.result = await this.Model.read(this.query)
  }
}

module.exports = Read
