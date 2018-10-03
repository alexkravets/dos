'use strict'

const { Read: ReadOperation } = require('@slatestudio/adept')
const Handler = require('../Handler')

class Read extends Handler(ReadOperation) {
  async action() {
    this.result = await this.Model.read(this.query)
  }
}

module.exports = Read
