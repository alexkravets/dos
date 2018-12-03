'use strict'

const Operation     = require('lib/Operation')
const Specification = require('test/example/models/Specification')

class Spec extends Operation {
  static get shouldValidateOutput() {
    return false
  }

  static get resource() {
    return Specification
  }

  static get outputSchema() {
    const { id } = this
    return this.resource.schema.clone(`${id}Output`)
  }

  async before() {
    return null
  }

  async after() {
    this.result = this.result.data
  }
}

module.exports = Spec
