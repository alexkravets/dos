'use strict'

const get               = require('lodash.get')
const cookie            = require('cookie')
const { decode }        = require('jsonwebtoken')
const capitalize        = require('lodash.capitalize')
const verifyToken       = require('./verifyToken')
const AccessDeniedError = require('../errors/AccessDeniedError')
const UnauthorizedError = require('../errors/UnauthorizedError')

class JwtAuthorization {
  static createRequirement(options) {
    /* istanbul ignore next */
    if (!options.publicKey) {
      throw new Error('"JwtAuthorization.createRequirement" requires' +
        ' "publicKey" to be defined')
    }

    const name = get(options, 'name', 'authorization')
    const requirementName = capitalize(name)

    return {
      [requirementName]: {
        definition: {
          in:   'header',
          type: 'apiKey',
          name
        },
        klass: this,
        name,
        ...options
      }
    }
  }

  static get errors() {
    return {
      UnauthorizedError: {
        statusCode:  401,
        description: 'Unauthorized request'
      },
      AccessDeniedError: {
        statusCode:  403,
        description: 'Operation access denied'
      }
    }
  }

  constructor({
    name,
    publicKey,
    algorithm = 'RS256',
    tokenVerificationMethod  = verifyToken,
    accessVerificationMethod = () => [ true ]
  }) {
    this._name      = name
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
      token = cookies[this._name]
    }

    if (!token) {
      token = headers[this._name]
    }

    if (!token) {
      const error = new UnauthorizedError(`Header "${this._name}" is missing`)
      return { isAuthorized: false, error }
    }

    const object = decode(token, { complete: true })

    if (!object) {
      const error = new UnauthorizedError('Invalid authorization token')
      return { isAuthorized: false, error }
    }

    const [ isTokenOk, tokenErrorMessage ] =
      await this._verifyToken(context, token, this._publicKey, this._algorithm)

    if (!isTokenOk) {
      const error = new UnauthorizedError(tokenErrorMessage)

      return { isAuthorized: false, error }
    }

    const { payload } = object
    const [ isAccessOk, accessErrorMessage ] =
      await this._verifyAccess(context, payload)

    if (!isAccessOk) {
      const error = new AccessDeniedError(accessErrorMessage)
      return { isAuthorized: false, error }
    }

    return { isAuthorized: true, ...payload }
  }
}

module.exports = JwtAuthorization
