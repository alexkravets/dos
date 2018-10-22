'use strict'

const BaseOperation = require('./BaseOperation')
const toLower = require('lodash.tolower')

class Create extends BaseOperation {
  static get type() {
    return this.types.CREATE
  }

  static get summary() {
    return `Create ${toLower(this.resourceName)}`
  }

  async action() {
    const Model = this.constructor.resource
    this.status = this.status || 'Created'

    let data
    if (this.constructor.actionMethodName) {
      data = await Model[this.constructor.actionMethodName](this.context, this.mutation)

    } else {
      data = await Model.create(this.context, this.mutation)
    }

    this.result = { data }
  }
}

module.exports = Create
