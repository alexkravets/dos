'use strict'

const Read = require('lib/operations/Read')
const { Service } = require('test/app/components')

class Health extends Read {
  static get summary() {
    return 'Check service health'
  }

  static get description() {
    return 'Returns service name, version and API version.'
  }

  static get tags() {
    return [ 'Common' ]
  }

  static get query() {
    return {}
  }

  static get resource() {
    return Service
  }

  get shouldVerifyResponse() {
    return false
  }
}

module.exports = Health
