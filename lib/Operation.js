'use strict'

const statuses       = require('statuses')
const OperationError = require('./errors/OperationError')
const InvalidRequestParameters = require('./errors/InvalidRequestParameters')
const { Operation: BaseOperation, Schema } = require('@slatestudio/adept')

class Operation extends BaseOperation {
  static get defaultError() {
    return OperationError
  }

  static get actionMethodName() {
    return null
  }

  static _verifyInstanceActionMethod() {
    if (this.resource.prototype[this.actionMethodName]) { return }

    const message = `Operation \`${this.name}\` references` +
      ` \`${this.actionMethodName}\` as instance method of ${this.resourceName}` +
      ' resource, but it is not defined.'

    throw new Error(message)
  }

  static _verifyClassActionMethod() {
    if (this.resource[this.actionMethodName]) { return }

    const message = `Operation \`${this.name}\` references` +
      ` \`${this.actionMethodName}\` as class method of ${this.resourceName}` +
      ' resource, but it is not defined.'

    throw new Error(message)
  }

  static buildValidators() {
    super.buildValidators()

    if (this.actionMethodName) {
      if (this.type == this.types.CREATE) {
        this._verifyClassActionMethod()

      } else {
        this._verifyInstanceActionMethod()

      }
    }
  }

  static get resultSchema() {
    if (this._resultSchema) { return this._resultSchema }

    this._resultSchema = new Schema(`${this.name}Result`, {
      data: this.reference(this.output, true)
    })

    return this._resultSchema
  }

  constructor(req = {}) {
    super()

    this.req        = req
    this.query      = req.query || {}
    this.headers    = {}
    this.mutation   = req.mutation
    this._isSuccess = true

    this._normalizeRequestHeaders()
  }

  _normalizeRequestHeaders() {
    const headers = {}
    for (const name in this.req.headers) {
      headers[name.toLowerCase()] = this.req.headers[name]
    }

    this.req.headers = headers
  }

  set context(value = {}) {
    this._context = Object.assign(this.context, value)
  }

  get context() {
    return this._context || {}
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
        return
      }
    }

    throw authorizationError
  }

  async _initialize() {
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

  _cleanupErrorResult() {
    this.constructor.defaultError.schema.cleanup(this.result)
  }

  async _verifyResult() {
    if (!this.result) { return }

    const json  = JSON.stringify(this.result)
    this.result = JSON.parse(json)

    if (!this.shouldVerifyResponse) { return }

    if (this._isSuccess) {
      await this._verifySuccessResult()

    } else {
      this._cleanupErrorResult()

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
    const isUnhandledError = !error.code || !error.constructor.prototype.status

    if (isUnhandledError) {
      error = new this.constructor.defaultError([ error ])
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

module.exports = Operation
