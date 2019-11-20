'use strict'

const HealthComponent = require('test/example/components/Health')
const createOperation = require('lib/helpers/createOperation')

class Health extends createOperation('Health', HealthComponent,
  'Returns service health status', {
    tags: [ 'Common' ],
    summary: 'Health'
  }) {
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
