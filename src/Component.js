'use strict'

class Component {
  static get id() {
    return this.name
  }

  static get schema() {
    return this._schema
  }

  static set schema(schema) {
    this._schema = schema

    return schema
  }

  constructor(context = {}, attributes = {}) {
    this._context    = context
    this._validator  = context.validator
    this._attributes = attributes

    if (!this._validator) {
      throw new Error(`Validator is undefined for "${this.componentId}:${this.id}"`)
    }
  }

  get context() {
    return this._context
  }

  get componentId() {
    return this.constructor.id
  }

  get id() {
    return this.attributes.id || null
  }

  get attributes() {
    return this._attributes
  }

  get json() {
    return JSON.parse(JSON.stringify(this))
  }

  toJSON() {
    return this._attributes
  }

  validate() {
    return this._validator.validate(this.json, this.componentId)
  }
}

module.exports = Component
