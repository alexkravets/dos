'use strict'

const cookie             = require('cookie')
const AccessDeniedError  = require('../errors/AccessDeniedError')
const UnauthorizedError  = require('../errors/UnauthorizedError')
const { verify, decode } = require('jsonwebtoken')

class JwtAuthorization {
  static createRequirement(
    publicKey,
    algorithm = 'RS256',
    verificationMethod = () => true
  ) {
    /* istanbul ignore next */
    if (!publicKey) {
      throw new Error('"JwtAuthorization.createRequirement" requires' +
        ' "publicKey" to be defined')
    }

    const { name } = this

    return {
      [name]: {
        definition: {
          in:   'header',
          type: 'apiKey',
          name
        },
        klass: this,
        publicKey,
        algorithm,
        verificationMethod
      }
    }
  }

  static get errors() {
    return {
      UnauthorizedError: { statusCode: 401 },
      AccessDeniedError: { statusCode: 403 }
    }
  }

  constructor({ publicKey, algorithm, verificationMethod }) {
    this._publicKey = publicKey
    this._algorithm = algorithm
    this._verificationMethod = verificationMethod
  }

  async verify(context) {
    let token
    const { headers } = context

    const hasCookie = headers['cookie']

    if (hasCookie) {
      const cookies = cookie.parse(headers['cookie'])
      token = cookies.authorization
    }

    if (!token) {
      token = headers.authorization
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

    try {
      verify(token, this._publicKey, { algorithms: [ this._algorithm ] })

    } catch (originalError) {
      const error = new UnauthorizedError()
      return { isAuthorized: false, error }

    }

    const { payload }  = object
    const isAuthorized = this._verificationMethod(payload)

    if (!isAuthorized) {
      const error = new AccessDeniedError()
      return { isAuthorized: false, error }
    }

    return { isAuthorized: true, identity: payload }
  }
}

module.exports = JwtAuthorization
