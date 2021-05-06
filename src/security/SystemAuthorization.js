'use strict'

const get = require('lodash.get')
const AccessDeniedError = require('../errors/AccessDeniedError')

class SystemAuthorization {
  static createRequirement(options = {}) {
    const { name: requirementName } = this
    const name = get(options, 'name', 'authorization')

    return {
      [requirementName]: {
        definition: {
          description: 'This security definition and a header for system' +
            ' operations should be ignored. The verification method of system' +
            ' operations relies on a gateway that adds headers for all' +
            ' external requests. Request without headers considered to be' +
            ' internal.',
          in:   'header',
          type: 'apiKey',
          name
        },
        klass: this
      }
    }
  }

  static get errors() {
    return {
      AccessDeniedError: {
        statusCode:  403,
        description: 'Operation access denied, operation is available only' +
          ' for internal requests'
      }
    }
  }

  // NOTE: Verification method relies on a gateway that adds headers for all
  //       external requests. Request without headers considered to be internal.
  async verify(context) {
    const { headers } = context
    const isExternalRequest = Object.keys(headers).length > 0

    if (isExternalRequest) {
      const error = new AccessDeniedError()
      return { isAuthorized: false, error }
    }

    return { isAuthorized: true, accountId: 'SYSTEM' }
  }
}

module.exports = SystemAuthorization
