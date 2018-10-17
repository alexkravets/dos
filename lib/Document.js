'use strict'

const cloneDeep     = require('lodash.clonedeep')
const { Component } = require('@slatestudio/adept')
const DocumentNotFoundError = require('./errors/DocumentNotFoundError')

class Document extends Component {
  constructor(attributes = {}) {
    super()

    this._attributes = attributes
  }

  static get commonSchema() {
    return this.schemas['Common']
  }

  static get documentSchema() {
    return this.schemas[this.name]
  }

  static get schema() {
    if (this._schema) { return this._schema }

    if (this.commonSchema) {
      this._schema = this.commonSchema.merge(this.name, this.documentSchema)

    } else {
      this._schema = this.documentSchema.clone(this.name)

    }

    return this._schema
  }

  static async create(context, attributes) {
    const doc = cloneDeep(attributes)

    doc.createdAt = new Date().toJSON()

    if (this.beforeCreate) { await this.beforeCreate(context, doc) }

    await this._create(doc)
    const object = new this(doc) // NOSONAR

    if (this.afterCreate) { await this.afterCreate(context, object) }

    return object
  }

  static async index(context, query, options) {
    let { items, ...rest } = await this._index(query, options)

    const objects = items.map(item => new this(item))

    return { objects, ...rest }
  }

  static async read(context, query = {}) {
    const { id } = query
    let object

    if (id) {
      const doc = await this._read(id)
      object = new this(doc) // NOSONAR

    } else {
      const [ object ] = await this.index(query)

      if (!object) {
        throw new DocumentNotFoundError(this.name)
      }
    }

    return object
  }

  static async update(context, query, attributes) {
    let { id } = query

    if (!id) {
      const object = await this.read(query)
      id = object.id
    }

    if (this.beforeUpdate) { await this.beforeUpdate(context, query, attributes) }

    attributes = cloneDeep(attributes)
    attributes.updatedAt = new Date().toJSON()

    const doc    = await this._update(id, attributes)
    const object = new this(doc) // NOSONAR

    if (this.afterUpdate) { await this.afterUpdate(context, query, attributes, object) }

    return object
  }

  static async delete(context, query) {
    if (this.beforeDelete) { await this.beforeDelete(context, query) }

    const { id } = query
    await this._delete(id)

    if (this.afterDelete) { await this.afterDelete(context, query) }
  }

  get attributes() {
    return this._attributes
  }

  get id() {
    return this.attributes.id
  }

  toJSON() {
    return this.attributes
  }
}

module.exports = Document
