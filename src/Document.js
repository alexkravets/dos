'use strict'

const omit       = require('lodash.omit')
const Schema     = require('./Schema')
const Component  = require('./Component')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

class Document extends Component {
  static get documentIdKey() {
    return 'id'
  }

  static get defaultIndexSortKey() {
    return 'createdAt'
  }

  static get bodySchema() {
    return this._bodySchema
  }

  static createSchema(schemas) {
    const documentName = startCase(this.name).toLowerCase()

    this._bodySchema = schemas[this.name] || new Schema(this.name, {})
    this._schema = this.bodySchema.clone({
      extend: {
        id: {
          description: capitalize(documentName) + ' ID',
          type:        'string',
          required:    true
        },
        createdAt: {
          description: `Date and time when ${documentName} was created`,
          type:        'string',
          format:      'date-time',
          required:    true
        },
        updatedAt: {
          description: `Date and time when ${documentName} was updated`,
          type:        'string',
          format:      'date-time'
        },
        createdBy: {
          description: `ID of a user who created ${documentName}`,
          type:        'string'
        },
        updatedBy: {
          description: `ID of a user who updated ${documentName}`,
          type:        'string'
        }
      }
    }, this.id)

    return this._schema
  }

  static async create(context, query, attributes) {
    const { composer } = context
    this.bodySchema.populateDefaultValues(attributes, composer.schemas)

    const { userId } = context.all

    if (userId) {
      attributes.createdBy = userId
    }

    const timestamp = new Date().toJSON()
    attributes.createdAt = timestamp
    attributes.updatedAt = timestamp

    if (this.beforeCreate) { await this.beforeCreate(context, attributes) }

    const doc    = await this._create(attributes)
    const object = new this(context, doc)

    if (this.afterCreate) { await this.afterCreate(context, object) }

    return object
  }

  static async index(context, query = {}, options = {}) {
    let { docs, ...rest } = await this._index(query, options)

    const objects = docs.map(doc => new this(context, doc))

    return { objects, ...rest }
  }

  static async read(context, query, options) {
    const doc    = await this._read(query, options)
    const object = new this(context, doc) // NOSONAR

    return object
  }

  static async update(context, query, attributes) {
    attributes = omit(attributes, [ this.documentIdKey, 'createdAt', 'createdBy' ])

    const { userId } = context.all

    if (userId) {
      attributes.updatedBy = userId
    }

    const timestamp = new Date().toJSON()
    attributes.updatedAt = timestamp

    if (this.beforeUpdate) { await this.beforeUpdate(context, query, attributes) }

    const doc    = await this._update(query, attributes)
    const object = new this(context, doc)

    if (this.afterUpdate) { await this.afterUpdate(context, query, attributes, object) }

    return object
  }

  static async delete(context, query) {
    if (this.beforeDelete) { await this.beforeDelete(context, query) }

    await this._delete(query)

    if (this.afterDelete) { await this.afterDelete(context, query) }
  }

  delete() {
    return this.constructor.delete(this.context, this._getQuery)
  }

  async update(attributes, shouldMutate = false) {
    const updatedDoc = await this.constructor.update(this.context, this._getQuery, attributes)

    if (shouldMutate) {
      this._attributes = updatedDoc.attributes
    }

    return updatedDoc
  }

  get _getQuery() {
    const query = {}

    const { documentIdKey } = this.constructor
    query[documentIdKey] = this.attributes[documentIdKey]

    return query
  }
}

module.exports = Document
