'use strict'

const omit          = require('lodash.omit')
const cloneDeep     = require('lodash.clonedeep')
const { Component } = require('@slatestudio/adept')
const DocumentNotFound = require('./errors/DocumentNotFound')

class Document extends Component {
  constructor(context = {}, attributes = {}) {
    super()

    this._context    = context
    this._attributes = attributes
  }

  static get commonSchema() {
    return this.schemas['Common']
  }

  static get documentSchema() {
    const schema = this.schemas[this.name]

    if (!schema) {
      const schemas = Object.keys(this.schemas).join(', ')
      throw new Error(`Schema for ${this.name} is not found, defined schemas:` +
        ` ${schemas}`)
    }

    return schema
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
    let doc = {}

    if (this.documentSchema) {
      this.documentSchema.updateDefaults(doc)
    }

    doc = Object.assign(doc, cloneDeep(attributes))

    doc.createdAt = new Date().toJSON()
    if (context.userId) {
      doc.createdBy = context.userId
    }

    if (this.beforeCreate) { await this.beforeCreate(context, doc) }

    await this._create(doc)
    const object = new this(context, doc) // NOSONAR

    if (this.afterCreate) { await this.afterCreate(context, object) }

    return object
  }

  static async index(context, query, options) {
    let { docs, ...rest } = await this._index(query, options)

    const objects = docs.map(doc => new this(context, doc))

    return { objects, ...rest }
  }

  static async read(context, query = {}) {
    const { id } = query
    let object

    if (id) {
      const doc = await this._read(id)
      object = new this(context, doc) // NOSONAR

    } else {
      const [ object ] = await this.index(query)

      if (!object) {
        throw new DocumentNotFound(this.name)
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

    attributes = omit(attributes, ['id', 'createdAt', 'createdBy', '_isDeleted'])

    if (this.beforeUpdate) { await this.beforeUpdate(context, query, attributes) }

    attributes.updatedAt = new Date().toJSON()
    if (context.userId) {
      attributes.updatedBy = context.userId
    }

    const doc    = await this._update(id, attributes)
    const object = new this(context, doc)

    if (this.afterUpdate) { await this.afterUpdate(context, query, attributes, object) }

    return object
  }

  // TODO:
  // attributes.updatedAt = new Date().toJSON()
  // if (context.userId) {
  //   attributes.updatedBy = context.userId
  // }

  static async delete(context, query) {
    if (this.beforeDelete) { await this.beforeDelete(context, query) }

    const { id } = query
    await this._delete(id)

    if (this.afterDelete) { await this.afterDelete(context, query) }
  }

  async save(parameters = {}) {
    const isCreated  = !!this.id
    const attributes = Object.assign(cloneDeep(this.attributes), cloneDeep(parameters))

    let object

    if (isCreated) {
      object = await this.constructor.update(this._context, { id: this.id }, attributes)

    } else {
      object = await this.constructor.create(this._context, attributes)

    }

    this._attributes = object.attributes
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
