'use strict'

const toLower   = require('lodash.tolower')
const Operation = require('../Operation')

class Update extends Operation {
  static get type() {
    return this.types.UPDATE
  }

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

  async action() {
    let data

    const Model = this.constructor.resource

    if (this.constructor.actionMethodName) {
      const object = await this.Model.read(this.context, this.query)
      data = await object[this.constructor.actionMethodName](this.mutation)

    } else {
      data = await Model.update(this.context, this.query, this.mutation)

    }

    this.result = { data }
  }
}

module.exports = Update
