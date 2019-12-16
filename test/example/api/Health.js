'use strict'

const Operation       = require('lib/Operation')
const HealthComponent = require('test/example/components/Health')

class Health extends Operation {
  static get Component() {
    return HealthComponent
  }

  static get tags() {
    return [ 'Common' ]
  }

  static get summary() {
    return 'Service health'
  }

  static get description() {
    return 'Returns service health status'
  }

  static get shouldValidateOutput() {
    return false
  }

  async before() {
    return null
  }

  async after() {
    return null
  }
}

module.exports = Health
