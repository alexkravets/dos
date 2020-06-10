'use strict'

const isEmpty        = require('lodash.isempty')
const cloneDeep      = require('lodash.clonedeep')
const defaultId      = require('./helpers/defaultId')
const { Schema }     = require('@kravc/schema')
const defaultTags    = require('./helpers/defaultTags')
const defaultSummary = require('./helpers/defaultSummary')

class Operation {
  static get types() {
    return {
      READ:   'read',
      CREATE: 'create',
      UPDATE: 'update',
      DELETE: 'delete'
    }
  }

  static get type() {
    return Operation.types.READ
  }

  static get id() {
    return defaultId(this)
  }

  static get tags() {
    return defaultTags(this.Component)
  }

  static get summary() {
    return defaultSummary(this.Component, this.componentAction)
  }

  static get description() {
    return ''
  }

  static get security() {
    return []
  }

  static async authorize() {
    return null
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

  // TODO: Resolve with better errors:
  // TODO: Move these default errors to composer as well:
  static get errors() {
    const errors = {}
    const { inputSchema, outputSchema } = this

    if (inputSchema) {
      errors.InvalidInputError = { statusCode: 401 }
    }

    if (outputSchema) {
      errors.InvalidOutputError = { statusCode: 500 }
    }

    return errors
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

  constructor(context) {
    this._context = context
  }

  setHeader(name, value) {
    this._headers = this._headers || {}
    this._headers[name.toLowerCase()] = value
  }

  get context() {
    return this._context
  }

  async exec(_parameters) {
    let parameters = cloneDeep(_parameters)
    let result

    if (this.before) {
      parameters = await this.before(parameters)
    }

    if (this.action) {
      result = await this.action(parameters)

    } else {
      result = await this._componentAction(parameters)

    }

    if (this.after) {
      result = await this.after(parameters, result)
    }

    return { result, headers: this._headers }
  }

  async _componentAction(parameters) {
    const { componentActionMethod } = this.constructor

    const { mutation, ...query } = parameters

    const data = await (mutation ?
      componentActionMethod(this.context, query, mutation) :
      componentActionMethod(this.context, query)
    )

    return { data }
  }
}

module.exports = Operation
