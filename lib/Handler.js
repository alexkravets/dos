'use strict'

const chalk    = require('chalk')
const statuses = require('statuses')
const isString = require('lodash.isstring')
const InvalidRequestParameters = require('./errors/InvalidRequestParameters')

const Handler = (Operation) => class extends Operation {
  static async handler(req) {
    const handler = new this(req)
    return await handler.exec()
  }

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
    this.mutation = req.body  || req.mutation

    this._context   = {}
    this._isSuccess = true
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

  get shouldVerifyResponse() {
    return true
  }

  async _authorize() {
    const { security } = this.constructor

    if (security.length == 0) {
      return
    }

    let authorizationErrorsCount
    let authorizationError

    for (const orRequirement of security) {
      authorizationErrorsCount = 0

      for (const andRequirementKey in orRequirement) {
        const andRequirement = orRequirement[andRequirementKey]
        const Requirement    = new andRequirement.klass(this.req)
        const { options }    = andRequirement

        const { isAuthorized, error, context } = await Requirement.isAuthorized(options)

        if (isAuthorized) {
          this.context = context

        } else {
          authorizationError = error
          authorizationErrorsCount += 1

        }
      }

      if (authorizationErrorsCount == 0) {
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
      const parameters = this.query

      if (this.mutation) {
        parameters.mutation = this.mutation
      }

      this.constructor.inputSchema.cleanup(parameters)
      this.constructor.inputSchema.updateTypes(parameters)
      this.constructor.inputSchema.updateDefaults(parameters)
      await this.constructor.inputSchema.validate(parameters)

      this.mutation = parameters.mutation
      delete parameters.mutation

      this.query = parameters

    } catch (errors) {
      throw new InvalidRequestParameters(errors)

    }
  }

  async action() {
    this.result = null
  }

  async _verifySuccessResult() {
    if (!this.constructor.output) {
      delete this.result
      return
    }

    this.constructor.resultSchema.cleanup(this.result)
    await this.constructor.resultSchema.validate(this.result)
  }

  async _verifyErrorResult() {
    this.constructor.defaultError.schema.cleanup(this.result)
    // NOTE: Might be too restrictive, some error might not match original error
    //       spec.
    // await this.constructor.defaultError.schema.validate(this.result)
  }

  async _verifyResult() {
    if (!this.result) { return }

    const json  = JSON.stringify(this.result)
    this.result = JSON.parse(json)

    if (!this.shouldVerifyResponse) { return }

    if (this._isSuccess) {
      await this._verifySuccessResult()

    } else {
      await this._verifyErrorResult()

    }
  }

  _response() {
    let { headers, result } = this

    if (!this.status) {
      this.status = result ? 'OK' : 'No Content'

      if (this.constructor.type == this.constructor.types.CREATE) {
        this.status = 'Created'
      }
    }

    const statusCode = statuses(this.status)

    for (const name in headers) {
      headers[name] = String(headers[name])
    }

    return { statusCode, headers, result }
  }

  _setErrorResult(error) {
    const isUnhandledError = !error.code && !error.constructor.prototype.status

    if (isUnhandledError) {
      error = new this.constructor.defaultError(error)
    }

    this.result = { error }
    this.status = error.status
    this._isSuccess = false
  }

  async exec() {
    try {
      await this._authorize()
      await this._initialize()

      if (this.before) { await this.before() }

      await this.action()

      if (this.after) { await this.after() }

    } catch (error) {
      this._setErrorResult(error)

    }

    try {
      await this._verifyResult()

    } catch (error) {
      this._setErrorResult(error)

    }

    return this._response()
  }
}

module.exports = Handler
