'use strict'

const { get } = require('lodash')
const AccessDeniedError = require('../errors/AccessDeniedError')

const SYSTEM_NAME = 'System'

const verifySystemAccess = (context) => {
  const { headers } = context
  const isExternalRequest = Object.keys(headers).length > 0

  if (!isExternalRequest) {
    return [ true ]
  }

  return [ false ]
}

class SystemAuthorization {
  static createRequirement(options = {}) {
    const name = get(options, 'name', 'authorization')

    const requirementName = SYSTEM_NAME

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
        klass: this,
        ...options
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

  constructor({
    accessVerificationMethod = verifySystemAccess,
  }) {
    this._verifyAccess = accessVerificationMethod
  }

  async verify(context) {
    const [ isAccessOk, accessErrorMessage ] = await this._verifyAccess(context)

    if (!isAccessOk) {
      const error = new AccessDeniedError(accessErrorMessage)
      return { isAuthorized: false, error }
    }

    return { isAuthorized: true, isSystem: true }
  }
}

module.exports = SystemAuthorization
