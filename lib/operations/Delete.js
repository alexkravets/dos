'use strict'

const { Delete: DeleteOperation } = require('@slatestudio/adept')
const Handler = require('../Handler')

class Delete extends Handler(DeleteOperation) {
  async action() {
    const Model = this.constructor.resource
    this.result = await Model.delete(this.query)
  }
}

module.exports = Delete
