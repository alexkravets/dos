'use strict'

const AccessDeniedError = require('../errors/AccessDeniedError')

class SystemAuthorization {
  static createRequirement() {
    const { name } = this

    return {
      [name]: {
        definition: {
          in:   'header',
          type: 'apiKey',
          name: 'Authorization',
          description: 'System operations could only be executed internally.' +
            ' This security definition and header should be ignored. They are' +
            ' used to identify internal operations and differentiate them from' +
            ' public operations.'
        },
        klass: this
      }
    }
  }

  static get errors() {
    return {
      AccessDeniedError: {
        statusCode:  403,
        description: 'Operation access denied, operation could only be' +
          ' executed internally'
      }
    }
  }

  // NOTE: This verification method relies on gateway which adds headers for
  //       all external requests.
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
