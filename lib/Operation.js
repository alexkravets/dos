'use strict'

const Schema   = require('./Schema')
const isEmpty  = require('lodash.isempty')
const statuses = require('statuses')
const Security = require('./Security')
const OperationError     = require('./OperationError')
const OperationContext   = require('./OperationContext')
const InvalidInputError  = require('./errors/InvalidInputError')
const InvalidOutputError = require('./errors/InvalidOutputError')

const TYPES = {
  create: 'create',
  read:   'read',
  update: 'update',
  delete: 'delete'
}

class Operation {
  static get types() {
    return TYPES
  }

  static get type() {
    return Operation.types.read
  }

  static get path() {
    return `/${this.id}`
  }

  static get method() {
    switch (this.type) {
      case 'create': return 'post'
      case 'delete': return 'delete'
      case 'update': return 'patch'
      default:       return 'get'
    }
  }

  static statusCode(status = 'undefined') {
    try {
      const code = statuses(status)
      return code

    } catch (error) {
      throw new Error(`Invalid status \`${status}\` for operation \`${this.id}\``)

    }
  }

  static get id() {
    return this.name
  }

  static get tags() {
    return []
  }

  static get summary() {
    return ''
  }

  static get description() {
    return ''
  }

  static get security() {
    return []
  }

  static get resource() {
    return null
  }

  static get resourceAction() {
    return this.type
  }

  static get resourceActionMethod() {
    return this.resource[this.resourceAction].bind(this.resource)
  }

  static get outputSchema() {
    if (this.resource) {
      const { id } = this
      return new Schema(`${id}Output`, {
        data: {
          $ref:     this.resource.schema.id,
          required: true
        }
      })
    }

    return null
  }

  static get shouldValidateOutput() {
    return true
  }

  static get query() {
    return {}
  }

  static get mutation() {
    if (this.resource) {
      const { id, type } = this
      const { bodySchema, schema } = this.resource
      const resourceSchema = bodySchema || schema

      if (type == Operation.types.create) {
        return resourceSchema.clone(`${id}InputMutation`)
      }

      if (type == Operation.types.update) {
        return resourceSchema.clone(`${id}InputMutation`, { isUpdate: true })
      }
    }

    return null
  }

  static get inputSchema() {
    const { id } = this
    let source = { ...this.query }

    if (this.mutation) {
      source = {
        ...source,
        mutation: {
          $ref:     `${id}InputMutation`,
          required: true
        }
      }
    }

    const isEmptySource = isEmpty(source)
    if (isEmptySource) {
      return null
    }

    return new Schema(`${id}Input`, source)
  }

  static get errors() {
    const errors = {}
    const { inputSchema, outputSchema } = this

    if (inputSchema) {
      errors.InvalidInputError = { status: 'Bad Request' }
    }

    if (outputSchema) {
      errors.InvalidOutputError = { status: 'Internal Server Error' }
    }

    return errors
  }

  constructor({ composer, req }) {
    const { operationId } = this

    this._req     = req || { headers: {}, query: {} }
    this._context = new OperationContext(operationId, composer)

    const headers = {}
    for (const name in this.req.headers) {
      headers[name.toLowerCase()] = this.req.headers[name]
    }

    this.req.headers = headers
  }

  get operationId() {
    return this.constructor.id
  }

  get req() {
    return this._req
  }

  get query() {
    return this.req.query
  }

  set query(value) {
    this.req.query = value
  }

  get mutation() {
    return this.req.mutation
  }

  set mutation(value) {
    this.req.mutation = value
  }

  get context() {
    return this._context
  }

  set context(hash) {
    this._context.set(hash)
  }

  get composer() {
    return this._context.composer
  }

  get status() {
    if (this._status) { return this._status }

    const { type, outputSchema } = this.constructor

    if (!outputSchema) { return 'No Content' }
    if (type == Operation.types.create) { return 'Created' }

    return 'OK'
  }

  get statusCode() {
    return Operation.statusCode(this.status)
  }

  get result() {
    return this._result || null
  }

  set result(value) {
    this._result = value
  }

  get _output() {
    const json = JSON.stringify(this.result)
    return JSON.parse(json)
  }

  async _authorize() {
    const { security } = this.constructor
    this.context = await Security.authorize({ req: this.req, ...this.context }, security)
  }

  async _validateInput() {
    const { inputSchema } = this.constructor

    if (!inputSchema) { return { query: {}, mutation: null } }

    const input = { ...this.query }
    if (this.mutation) {
      input.mutation = { ...this.mutation }
    }

    let result
    try {
      result = await this.composer.validateInput(inputSchema.id, input)

    } catch (validationError) {
      throw new InvalidInputError(validationError)

    }

    const { mutation } = result
    delete result.mutation

    return { query: result, mutation }
  }

  async action() {
    const { resourceActionMethod } = this.constructor

    const data = await resourceActionMethod(this.context, this.query, this.mutation)

    return { data }
  }

  async _validateOutput() {
    const { shouldValidateOutput, outputSchema } = this.constructor

    if (!shouldValidateOutput) { return this._output }

    if (!outputSchema) { return }

    let result
    try {
      result = await this.composer.validateOutput(outputSchema.id, this._output)

    } catch (validationError) {
      throw new InvalidOutputError(validationError)

    }

    return result
  }

  _errorStatus(error) {
    const { errors } = this.constructor
    const { code }   = error

    if (!code) { return 'Internal Server Error' }
    if (!errors[code]) { return 'Internal Server Error' }

    return errors[code].status
  }

  async exec() {
    try {
      await this._authorize()

      const { query, mutation } = await this._validateInput()

      this.context  = { query }
      this.query    = query
      this.mutation = mutation

      if (this.before) { await this.before() }

      this.result = await this.action()

      if (this.after) { await this.after() }

      this.result = await this._validateOutput()

    } catch (error) {
      this._status = this._errorStatus(error)
      this.result  = new OperationError(this.context, this._status, error).json

    }

    const response = { statusCode: this.statusCode }
    if (this.result) { response.result = this.result }

    return response
  }
}

module.exports = Operation
