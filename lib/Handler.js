'use strict'

const statuses = require('statuses')
const { isString } = require('lodash')
const HandlerError = require('./HandlerError')

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
    const handler = new this(req) // NOSONAR
    return await handler.exec()
  }

  static get operationError() {
    return this.reference(HandlerError)
  }

  get Model() {
    return this.constructor.resource
  }

  async authorize() {
    const { security } = this.constructor

    if (security.length == 0) {
      return
    }

    let isAuthorizationError = false
    let authorizationError   = { status: 'Unauthorized' }

    for (const orRequirement of security) {
      for (const andRequirementKey in orRequirement) {
        const andRequirement = orRequirement[andRequirementKey]
        const Requirement    = new andRequirement.klass(this.req)
        const { options }    = andRequirement

        const { isAuthorized, error } = await Requirement.isAuthorized(options)

        isAuthorizationError += !isAuthorized
        authorizationError = error
      }

      if (!isAuthorizationError) {
        log.debug('Authorized')
        return
      }
    }

    const error  = new Error('Access denied')
    error.status = authorizationError.status
    error.code   = 'ACCESS_DENIED'
    error.originalError = authorizationError

    throw error
  }

  async initialize() {
    if (isString(this.mutation)) {
      this.mutation = JSON.parse(this.mutation)
    }

    log.debug({ query: this.query, mutation: this.mutation })

    const { query, mutation } = await this.constructor
      .buildParameters(this.query, this.mutation)

    this.query    = query
    this.mutation = mutation
  }

  async action() {
    this.result = null
  }

  response() {
    this.status = this.status || (this.result ? 'OK' : 'No Content')

    for (const name in this.headers) {
      this.headers[name] = String(this.headers[name])
    }

    let { headers, result, status } = this
    const statusCode = statuses(status)

    if (result) {
      const json = JSON.stringify(result)
      result = JSON.parse(json)
    }

    return { statusCode, headers, result }
  }

  async exec() {
    try {
      await this.authorize()
      await this.initialize()

      if (this.before) { await this.before() }

      await this.action()

      if (this.after) { await this.after() }

    } catch (error) {
      const handlerError = new HandlerError(error)

      this.status = handlerError.status
      this.result = handlerError.toObject()

      if (handlerError.statusCode == 500) {
        log.error(error)
      }
    }

    return this.response()
  }
}

module.exports = Handler
