'use strict'

const chalk        = require('chalk')
const statuses     = require('statuses')
const isString     = require('lodash.isstring')
const HandlerError = require('./HandlerError')
const InvalidRequestParametersError = require('./errors/InvalidRequestParametersError')

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

    this.query    = req.query || {}
    this.mutation = req.body  || req.mutation || {}

    this._context = {}
  }

  static async handler(req) {
    const handler = new this(req)
    return await handler.exec()
  }

  static get operationError() {
    return this.reference(HandlerError)
  }

  set context(value) {
    if (value) {
      this._context = Object.assign(this._context, value)
    }
  }

  get context() {
    return this._context
  }

  get Model() {
    return this.constructor.resource
  }

  async _authorize() {
    const { security } = this.constructor

    if (security.length == 0) {
      return
    }

    let isAuthorizationError = false
    let authorizationError

    for (const orRequirement of security) {
      for (const andRequirementKey in orRequirement) {
        const andRequirement = orRequirement[andRequirementKey]
        const Requirement    = new andRequirement.klass(this.req)
        const { options }    = andRequirement

        const { isAuthorized, error, context } = await Requirement.isAuthorized(options)

        isAuthorizationError += !isAuthorized
        authorizationError    = error
        this.context          = context
      }

      if (!isAuthorizationError) {
        const json = JSON.stringify(this.context)
        console.debug(chalk`{green Authorized} {dim ${json}}`)
        return
      }
    }

    throw authorizationError
  }

  async _initialize() {
    if (isString(this.mutation)) {
      this.mutation = JSON.parse(this.mutation)
    }

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
      await this._authorize()
      await this._initialize()

      if (this.before) { await this.before() }

      await this.action()

      if (this.after) { await this.after() }

    } catch (error) {
      const handlerError = new HandlerError(error)

      this.result = { error: handlerError.object }
      this.status = handlerError.status

      if (handlerError.status == 'Internal Server Error') {
        console.error(error)
      }
    }

    return this._response()
  }
}

module.exports = Handler
