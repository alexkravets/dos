'use strict'

class Component {
  static get id() {
    return this.name
  }

  static get schema() {
    return this._schema
  }

  static createSchema(schemas) {
    this._schema = schemas[this.name]
    return this._schema
  }

  constructor(context = {}, attributes = {}) {
    this._context    = context
    this._attributes = attributes
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
    return this.toJSON()
  }

  get context() {
    return this._context
  }

  get composer() {
    const { composer } = this.context
    if (composer) { return composer }

    const { componentId, id } = this
    throw new Error(`${componentId}:${id}.context is missing 'composer'`)
  }

  async validate() {
    const { json, composer, componentId } = this
    await composer.validate(componentId, json)
  }

  toJSON() {
    return this.attributes
  }
}

module.exports = Component
