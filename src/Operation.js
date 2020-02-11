'use strict'

const Schema             = require('./Schema')
const isEmpty            = require('lodash.isempty')
const statuses           = require('statuses')
const Security           = require('./Security')
const pluralize          = require('pluralize')
const startCase          = require('lodash.startcase')
const capitalize         = require('lodash.capitalize')
const OperationError     = require('./OperationError')
const OperationContext   = require('./OperationContext')
const InvalidInputError  = require('./errors/InvalidInputError')
const InvalidOutputError = require('./errors/InvalidOutputError')

const TYPES = {
  CREATE: 'create',
  READ:   'read',
  UPDATE: 'update',
  DELETE: 'delete'
}

class Operation {
  static get types() {
    return TYPES
  }

  static get type() {
    return Operation.types.READ
  }

  static get path() {
    return `/${this.id}`
  }

  static get method() {
    switch (this.type) {
      case TYPES.CREATE: return 'post'
      case TYPES.DELETE: return 'delete'
      case TYPES.UPDATE: return 'patch'
      default:           return 'get'
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

  static get Component() {
    return null
  }

  static get componentAction() {
    return this.type
  }

  static get componentActionMethod() {
    const { Component, componentAction } = this
    return Component[componentAction].bind(Component)
  }

  static get tags() {
    if (!this.Component) { return [] }

    const componentTitlePlural = pluralize(startCase(this.Component.name))
    return [ componentTitlePlural ]
  }

  static get summary() {
    if (!this.Component) { return '' }

    const { Component: { name }, componentAction } = this
    const componentTitle = startCase(name).toLowerCase()

    return capitalize(`${componentAction} ${componentTitle}`)
  }

  static get description() {
    return ''
  }

  static get security() {
    return []
  }

  static get output() {
    if (!this.Component) { return null }

    return {
      data: {
        $ref:     this.Component.schema.id,
        required: true
      }
    }
  }

  static get outputSchema() {
    const { id, output: schemaOrSource } = this

    if (!schemaOrSource) { return null }

    return new Schema(`${id}Output`, schemaOrSource)
  }

  static get query() {
    return {}
  }

  static get mutation() {
    const { type, Component } = this

    if (Component) {
      const { bodySchema, schema } = Component
      const mutationSchema = bodySchema || schema

      if (type === Operation.types.UPDATE) {
        return mutationSchema.clone({ isUpdate: true })
      }

      if (type === Operation.types.CREATE) {
        return mutationSchema.clone()
      }
    }

    return null
  }

  static get mutationSchema() {
    const { id, mutation: schemaOrSource } = this

    if (!schemaOrSource) { return null }

    return new Schema(`${id}InputMutation`, schemaOrSource)
  }

  static get inputSchema() {
    const { id } = this
    let source = { ...this.query }

    if (this.mutationSchema) {
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
    this._context = new OperationContext(composer, operationId, this._req)

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
    if (type === Operation.types.CREATE) { return 'Created' }

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

  async action() {
    const { Component } = this.constructor
    if (!Component) { return }

    const { componentActionMethod } = this.constructor
    const data = await componentActionMethod(this.context, this.query, this.mutation)

    return { data }
  }

  async exec() {
    let output

    try {
      await this._authorize()

      const { query, mutation } = this._validateInput()

      this.context  = { query }
      this.query    = query
      this.mutation = mutation

      if (this.before) { await this.before() }

      this.result = await this.action()

      if (this.after) { await this.after() }

      output = this._validateOutput()

    } catch (error) {
      this._status = this._errorStatus(error)

      output = new OperationError(this.context, this._status, error).json

    }

    const response = { statusCode: this.statusCode }
    if (output) { response.result = output }

    return response
  }

  get _resultPlainObject() {
    const json = JSON.stringify(this.result)
    return JSON.parse(json)
  }

  async _authorize() {
    const { security } = this.constructor
    const authorizationContext = await Security.authorize({ req: this.req, context: this.context }, security)
    this.context.set(authorizationContext)
  }

  _validateInput() {
    const { inputSchema } = this.constructor

    if (!inputSchema) { return { query: {}, mutation: null } }

    const input = { ...this.query }
    if (this.mutation) {
      input.mutation = { ...this.mutation }
    }

    let inputValid
    try {
      inputValid = this.composer.validateInput(inputSchema.id, input)

    } catch (validationError) {
      throw new InvalidInputError(validationError)

    }

    const { mutation, ...query } = inputValid

    return { query, mutation }
  }

  _validateOutput() {
    const { outputSchema } = this.constructor

    if (!outputSchema) { return }

    let output
    try {
      output = this.composer.validateOutput(outputSchema.id, this._resultPlainObject)

    } catch (validationError) {
      throw new InvalidOutputError(this._resultPlainObject, validationError)

    }

    return output
  }

  _errorStatus(error) {
    const { errors } = this.constructor
    const { code }   = error

    if (!code) { return 'Internal Server Error' }
    if (!errors[code]) { return 'Internal Server Error' }

    return errors[code].status
  }
}

module.exports = Operation
