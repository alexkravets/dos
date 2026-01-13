'use strict'

const { get, capitalize } = require('lodash')
const cookie            = require('cookie')
const { decode }        = require('jsonwebtoken')
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

    const name       = get(options, 'name', 'authorization')
    const cookieName = get(options, 'cookieName', name)
    const description = get(options, 'description')
    const requirementName = get(options, 'requirementName', capitalize(name))

    return {
      [requirementName]: {
        definition: {
          in:   'header',
          type: 'apiKey',
          name,
          description,
        },
        klass: this,
        name,
        cookieName,
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
    cookieName,
    algorithm = 'RS256',
    normalizePayload = payload => payload,
    tokenVerificationMethod = verifyToken,
    accessVerificationMethod = () => [ true ],
  }) {
    this._name       = name
    this._publicKey  = publicKey
    this._algorithm  = algorithm
    this._cookieName = cookieName

    this._verifyToken  = tokenVerificationMethod
    this._verifyAccess = accessVerificationMethod
    this._normalizePayload = normalizePayload
  }

  async verify(context) {
    let token

    const { headers } = context

    const hasCookie = headers['cookie']

    if (hasCookie) {
      const cookies = cookie.parse(headers['cookie'])
      token = cookies[this._cookieName]
    }

    if (!token) {
      token = headers[this._name]
    }

    if (!token) {
      const error = new UnauthorizedError(`Header "${this._name}" is missing`)
      return { isAuthorized: false, error }
    }

    token = token.replace(/^bearer\s+/i, '')

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

    const normalizedPayload = this._normalizePayload(payload)

    return { isAuthorized: true, ...normalizedPayload }
  }
}

module.exports = JwtAuthorization
