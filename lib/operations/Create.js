'use strict'

const { Create: CreateOperation } = require('@slatestudio/adept')
const Handler = require('../Handler')

class Create extends Handler(CreateOperation) {
  async action() {
    this.status = this.status || 'Created'

    const Model = this.constructor.resource
    this.result = await Model.create(this.mutation)
  }
}

module.exports = Create
