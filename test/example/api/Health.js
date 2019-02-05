'use strict'

const Operation       = require('lib/Operation')
const HealthComponent = require('test/example/components/Health')

class Health extends Operation {
  static get tags() {
    return [ 'Common' ]
  }

  static get shouldValidateOutput() {
    return false
  }

  static get resource() {
    return HealthComponent
  }

  async before() {
    return null
  }

  async after() {
    return null
  }
}

module.exports = Health
