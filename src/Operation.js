'use strict'

const isEmpty            = require('lodash.isempty')
const statuses           = require('statuses')
const pluralize          = require('pluralize')
const cloneDeep          = require('lodash.clonedeep')
const startCase          = require('lodash.startcase')
const { Schema }         = require('@kravc/schema')
const capitalize         = require('lodash.capitalize')
const { v4: uuid }       = require('uuid')
const OperationError     = require('./errors/OperationError')
const InvalidInputError  = require('./errors/InvalidInputError')
const InvalidOutputError = require('./errors/InvalidOutputError')

const TYPES = {
  CREATE: 'create',
  READ:   'read',
  UPDATE: 'update',
  DELETE: 'delete'
}

class Operation {
  static get id() {
    return this.name
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

  static get tags() {
    if (!this.Component) { return [] }

    const componentTitlePlural = pluralize(startCase(this.Component.name))
    return [ componentTitlePlural ]
  }

  static get security() {
    return []
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
        return mutationSchema.pure()
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

    return new Schema(schemaOrSource, `${id}InputMutation`)
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

    if (isEmpty(source)) { return null }

    return new Schema(source, `${id}Input`)
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

    return new Schema(schemaOrSource, `${id}Output`)
  }

  static get path() {
    return `/${this.id}`
  }

  static get types() {
    return TYPES
  }

  static get type() {
    return Operation.types.READ
  }

  static get method() {
    switch (this.type) {
      case TYPES.CREATE: return 'post'
      case TYPES.DELETE: return 'delete'
      case TYPES.UPDATE: return 'patch'
      default:           return 'get'
    }
  }

  static get Component() {
    return null
  }

  static get componentAction() {
    return this.type
  }

  // TODO: Check how this would work with composer:
  static get componentActionMethod() {
    const { Component, componentAction } = this

    if (!Component) { return null }

    return Component[componentAction].bind(Component)
  }

  // TODO: Resolve with better errors:
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

  constructor(validator, _headers = {}) {
    const { id: operationId, type, outputSchema } = this.constructor

    const headers = {}
    for (const name in _headers) {
      headers[name.toLowerCase()] = _headers[name]
    }

    this.context = { headers, operationId }

    this._headers    = null
    this._validator  = validator
    this._statusCode = 200

    if (!outputSchema) {
      this._statusCode = 204
    }

    if (type === Operation.types.CREATE) {
      this._statusCode = 201
    }
  }

  setHeader(name, value) {
    this._headers = this._headers || {}
    this._headers[name.toLowerCase()] = value
  }

  setStatus(status = 'UNDEFINED') {
    try {
      this._statusCode = statuses(status)

    } catch (error) {
      throw new Error(`Operation "${this.id}" sets invalid status "${status}"`)

    }
  }

  async exec(input) {
    const { inputSchema, outputSchema, errors } = this.constructor

    this.context.requestId         = uuid()
    this.context.requestReceivedAt = new Date().toISOString()

    let result

    try {
      // TODO: Finish security implementation:
      if (this.authorize) {
        this.context.identity = await this.authorize(this.context.headers)
      }

      if (inputSchema) {
        try {
          input = this._validator.validate(input, inputSchema.id)

        } catch (validationError) {
          throw new InvalidInputError(validationError, this.context)

        }

      } else {
        input = {}

      }

      const { mutation, ...query } = input
      this.context.query = query

      if (this.before) {
        input = await this.before(cloneDeep({ ...query, mutation }))
      }

      if (this.action) {
        result = await this.action(cloneDeep(input))

      } else {
        result = await this.componentAction(cloneDeep(input))

      }

      if (this.after) {
        result = await this.after(input, result)
      }

      if (outputSchema) {
        try {
          result = this._validator.validate(result, outputSchema.id)

        } catch (validationError) {
          throw new InvalidOutputError(result, validationError)

        }

      } else {
        result = null

      }

    } catch (error) {
      let errorStatus

      const { code } = error

      if (!code || !errors[code]) {
        errorStatus = 'Internal Server Error'

      } else {
        errorStatus = errors[code].status

      }

      this.setStatus(errorStatus)

      result = new OperationError(this.context, errorStatus, error).json
    }

    const response = {
      statusCode: this._statusCode
    }

    if (result) {
      response.result = result
    }

    if (this._headers) {
      response.headers = this._headers
    }

    return response
  }

  async componentAction(input) {
    const { componentActionMethod } = this.constructor

    const { mutation, ...query } = input

    const data = await (mutation ?
      componentActionMethod(this.context, query, mutation) :
      componentActionMethod(this.context, query)
    )

    return { data }
  }
}

module.exports = Operation
