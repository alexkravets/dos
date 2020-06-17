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

  static get errors() {
    let errors = {}

    for (const orRequirement of this.security) {
      const andRequirements = Object.values(orRequirement)

      for (const andRequirement of andRequirements) {
        errors = { ...andRequirement.klass.errors, ...errors }
      }
    }

    if (this.inputSchema) {
      errors.InvalidInputError = {
        statusCode:  400,
        description: 'Invalid operation input, make sure operation parameters' +
          ' do match specification'
      }
    }

    if (this.outputSchema) {
      errors.InvalidOutputError = {
        statusCode:  500,
        description: 'Invalid output returned by the operation, this issue' +
          ' to be addressed by service developer'
      }
    }

    return errors
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

  static get Component() {
    return null
  }

  static get componentAction() {
    return this.type
  }

  static get componentActionMethod() {
    const { Component, componentAction } = this

    if (!Component) {
      throw new Error(`Operation "${this.id}" expects component to be defined`)
    }

    const componentActionMethod = Component[componentAction]

    if (!componentActionMethod) {
      throw new Error(`Operation "${this.id}" expects component action` +
        ` method "${Component.name}.${componentAction}(context, ...)" to be` +
        ' defined')
    }

    return componentActionMethod.bind(Component)
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

  async action(parameters) {
    const { componentActionMethod } = this.constructor

    const { mutation, ...query } = parameters

    const data = await (mutation ?
      componentActionMethod(this.context, query, mutation) :
      componentActionMethod(this.context, query)
    )

    return { data }
  }

  async exec(_parameters) {
    let parameters = cloneDeep(_parameters)
    let result

    if (this.before) {
      const _ = await this.before(parameters)
      parameters = _ ? _ : parameters
    }

    result = await this.action(parameters)

    if (this.after) {
      const _ = await this.after(parameters, result.data || result)
      result = _ ? ( result.data ? { data: _ } : _ ) : result
    }

    return { result, headers: this._headers }
  }
}

module.exports = Operation
