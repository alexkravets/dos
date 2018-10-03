'use strict'

const { Update: UpdateOperation } = require('@slatestudio/adept')
const Handler = require('../Handler')

class Update extends Handler(UpdateOperation) {
  async action() {
    const Model = this.constructor.resource
    this.result = await Model.update(this.query, this.mutation)
  }
}

module.exports = Update
