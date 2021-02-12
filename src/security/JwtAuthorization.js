'use strict'

const cookie             = require('cookie')
const AccessDeniedError  = require('../errors/AccessDeniedError')
const UnauthorizedError  = require('../errors/UnauthorizedError')
const { verify, decode } = require('jsonwebtoken')

const verifyToken  = (token, publicKey, algorithm) => verify(token, publicKey, { algorithms: [ algorithm ] })
const verifyAccess = () => true

class JwtAuthorization {
  static createRequirement(options) {
    /* istanbul ignore next */
    if (!options.publicKey) {
      throw new Error('"JwtAuthorization.createRequirement" requires' +
        ' "publicKey" to be defined')
    }

    const { name } = this

    return {
      [name]: {
        definition: {
          in:   'header',
          type: 'apiKey',
          name: 'Authorization'
        },
        klass: this,
        ...options
      }
    }
  }

  static get errors() {
    return {
      UnauthorizedError: {
        statusCode:  401,
        description: 'Request authorization failed'
      },
      AccessDeniedError: {
        statusCode:  403,
        description: 'Operation access denied'
      }
    }
  }

  static get verifyToken() {
    return verifyToken
  }

  constructor({
    publicKey,
    algorithm = 'RS256',
    tokenVerificationMethod  = verifyToken,
    accessVerificationMethod = verifyAccess
  }) {
    this._publicKey = publicKey
    this._algorithm = algorithm

    this._verifyToken  = tokenVerificationMethod
    this._verifyAccess = accessVerificationMethod
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
      await this._verifyToken(token, this._publicKey, this._algorithm)

    } catch (originalError) {
      const error = new UnauthorizedError(originalError.message)
      return { isAuthorized: false, error }

    }

    const { payload }  = object
    const isAuthorized = await this._verifyAccess(payload)

    if (!isAuthorized) {
      const error = new AccessDeniedError()
      return { isAuthorized: false, error }
    }

    return { isAuthorized: true, ...payload }
  }
}

module.exports = JwtAuthorization
