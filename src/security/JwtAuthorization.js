'use strict'

const cookie             = require('cookie')
const AccessDeniedError  = require('../errors/AccessDeniedError')
const UnauthorizedError  = require('../errors/UnauthorizedError')
const { verify, decode } = require('jsonwebtoken')

class JwtAuthorization {
  static createRequirement(options = []) {
    const { name } = this

    return {
      [name]: {
        definition: {
          in:   'header',
          type: 'apiKey',
          name
        },
        klass: this,
        options
      }
    }
  }

  static get errors() {
    return {
      UnauthorizedError: { statusCode: 401 },
      AccessDeniedError: { statusCode: 403 }
    }
  }

  // static get algorithm() {
  //   return 'RS256'
  // }

  // constructor(headers) {
  //   this._headers = headers
  // }

  /* istanbul ignore next */
  // get publicKey() {
  //   throw new Error(`Public key is undefined for "${this.constructor.name}"`)
  // }

  authorize(options, payload) {
    const { group } = payload
    return options.includes(group)
  }

  async isAuthorized(context, options) {
    let token

    const hasCookie = this._headers['cookie']

    if (hasCookie) {
      const cookies = cookie.parse(this._headers['cookie'])
      token = cookies.authorization
    }

    if (!token) {
      token = this._headers.authorization
    }

    if (!token) {
      const error = new UnauthorizedError('Authorization header is missing')
      return { isAuthorized: false, error }
    }

    const object = decode(token, { complete: true })

    if (!object) {
      const error = new UnauthorizedError('Invalid authorization token')
      return { isAuthorized: false, error }
    }

    const { publicKey } = this

    try {
      verify(token, publicKey, { algorithms: [ this.constructor.algorithm ] })

    } catch (originalError) {
      const error = new UnauthorizedError()
      return { isAuthorized: false, error }

    }

    const { payload }  = object
    const isAuthorized = this.authorize(options, payload)

    if (!isAuthorized) {
      const error = new AccessDeniedError()
      return { isAuthorized: false, error }
    }

    return { isAuthorized: true, identity: payload }
  }
}

module.exports = JwtAuthorization
