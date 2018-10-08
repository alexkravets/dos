'use strict'

const statuses     = require('statuses')
const isString     = require('lodash.isstring')
const HandlerError = require('./HandlerError')
const InvalidRequestParametersError = require('./errors/InvalidRequestParametersError')

const log = console

const Handler = (Operation) => class extends Operation {
  constructor(req = {}) {
    super()

    const headers = {}
    for (const name in req.headers) {
      headers[name.toLowerCase()] = req.headers[name]
    }

    this.headers = {}
    this.req = req
    this.req.headers = headers

    this.query    = req.query    || {}
    this.mutation = req.mutation || {}
  }

  static async handler(req) {
    const handler = new this(req)
    return await handler.exec()
  }

  static get operationError() {
    return this.reference(HandlerError)
  }

  get Model() {
    return this.constructor.resource
  }

  // async _authorize() {
  //   const { security } = this.constructor

  //   if (security.length == 0) {
  //     return
  //   }

  //   let isAuthorizationError = false
  //   let authorizationError   = { status: 'Unauthorized' }

  //   for (const orRequirement of security) {
  //     for (const andRequirementKey in orRequirement) {
  //       const andRequirement = orRequirement[andRequirementKey]
  //       const Requirement    = new andRequirement.klass(this.req)
  //       const { options }    = andRequirement

  //       const { isAuthorized, error } = await Requirement.isAuthorized(options)

  //       isAuthorizationError += !isAuthorized
  //       authorizationError = error
  //     }

  //     if (!isAuthorizationError) {
  //       log.debug('Authorized')
  //       return
  //     }
  //   }

  //   const error  = new Error('Access denied')
  //   error.status = authorizationError.status
  //   error.code   = 'ACCESS_DENIED'
  //   error.originalError = authorizationError

  //   throw error
  // }

  async _initialize() {
    if (isString(this.mutation)) {
      this.mutation = JSON.parse(this.mutation)
    }

    log.debug({ query: this.query, mutation: this.mutation })

    try {
      const { query, mutation } = await this.constructor.buildParameters(this.query, this.mutation)

      this.query    = query
      this.mutation = mutation

    } catch (errors) {
      throw new InvalidRequestParametersError(errors)

    }
  }

  async action() {
    this.result = null
  }

  _response() {
    let { headers, result, status } = this

    status = status || (result ? 'OK' : 'No Content')
    const statusCode = statuses(status)

    for (const name in headers) {
      headers[name] = String(headers[name])
    }

    return { statusCode, headers, result }
  }

  async exec() {
    try {
      // await this._authorize()
      await this._initialize()

      if (this.before) { await this.before() }

      await this.action()

      if (this.after) { await this.after() }

    } catch (error) {
      const handlerError = new HandlerError(error)

      this.result = { error: handlerError.object }
      this.status = handlerError.status

      if (handlerError.status == 'Internal Server Error') {
        log.error(error)
      }
    }

    return this._response()
  }
}

module.exports = Handler
