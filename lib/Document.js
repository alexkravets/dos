'use strict'

const filter    = require('lodash.filter')
const cloneDeep = require('lodash.clonedeep')
const DocumentNotFoundError = require('./errors/DocumentNotFoundError')
const { Component, Schema } = require('@slatestudio/adept')

const rootPath = process.cwd()
const schemas  = Schema.load(`${rootPath}/app/schemas/`)

// TODO: Add support for request context
class Document extends Component {
  constructor(attributes = {}) {
    super()

    this.attributes = attributes
  }

  static getSchema(name) {
    return schemas[name]
  }

  static get commonSchema() {
    return this.getSchema('Common')
  }

  static get documentSchema() {
    return this.getSchema(this.name)
  }

  static get schema() {
    if (!this._schema) {
      this._schema = this.commonSchema.merge(this.name, this.documentSchema)
    }

    return this._schema
  }

  static async create(attributes) {
    const doc = cloneDeep(attributes)

    doc.createdAt = new Date().toJSON()

    if (this.beforeCreate) { await this.beforeCreate(doc) }

    await this._create(doc)
    const object = new this(doc) // NOSONAR

    if (this.afterCreate) { await this.afterCreate(object) }

    return object
  }

  static async index(query) {
    // TODO: This should be a very thing method
    // TODO: Pass through parameters to dynamodb query mechanics
    // TODO: Add support for query interface for dynamodb
    let { items, last_evaluated_key: lastEvaluatedKey } = await this._index()

    // TODO: Check if there is a way to get totalCount
    if (query) {
      items = filter(items, query)
    }

    const objects = items.map(item => new this(item))
    const count   = objects.length

    return { objects, count, lastEvaluatedKey }
  }

  static async read(query = {}) {
    const { id } = query
    let object

    if (id) {
      const doc = await this._read(id)
      object = new this(doc) // NOSONAR

    } else {
      const [ objects ] = await this.index(query)

      if (!object) {
        throw new DocumentNotFoundError(this.name)
      }
    }

    return object
  }

  static async update(query, attributes) {
    let { id } = query

    if (!id) {
      const object = await this.read(query)
      id = object.id
    }

    if (this.beforeUpdate) { await this.beforeUpdate(query, attributes) }

    attributes = cloneDeep(attributes)
    attributes.updatedAt = new Date().toJSON()

    await this.verifyAttributes(attributes)

    const doc    = await this._update(id, attributes)
    const object = new this(doc) // NOSONAR

    if (this.afterUpdate) { await this.afterUpdate(query, attributes, object) }

    return object
  }

  static async delete(query) {
    if (this.beforeDelete) { await this.beforeDelete(query) }

    const { id } = query
    await this._delete(id)

    if (this.afterDelete) { await this.afterDelete(query) }
  }

  toJSON() {
    return this.attributes
  }

  get id() {
    return this.attributes.id
  }
}

module.exports = Document