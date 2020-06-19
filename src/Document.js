'use strict'

const get        = require('lodash.get')
const omit       = require('lodash.omit')
const Component  = require('./Component')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

class Document extends Component {
  static get idKey() {
    return 'id'
  }

  static get bodySchema() {
    return this._bodySchema
  }

  static get schema() {
    return this._schema
  }

  static set schema(schema) {
    const documentName = startCase(this.id).toLowerCase()

    this._schema = schema.extend({
      id: {
        description: capitalize(documentName) + ' ID',
        required:    true
      },
      createdAt: {
        description: `Date and time when ${documentName} was created`,
        format:      'date-time',
        required:    true
      },
      updatedAt: {
        description: `Date and time when ${documentName} was updated`,
        format:      'date-time'
      },
      createdBy: {
        description: `ID of a user who created ${documentName}`
      },
      updatedBy: {
        description: `ID of a user who updated ${documentName}`
      }
    }, this.id)

    this._bodySchema = schema
  }

  static async create(context, query, mutation) {
    if (!mutation) {
      mutation = query
      query    = {}
    }

    const { validator } = context
    validator.normalize(mutation, this.id)

    const accountId = get(context, 'identity.accountId')

    if (accountId) {
      mutation.createdBy = accountId
    }

    const timestamp = new Date().toJSON()
    mutation.createdAt = timestamp
    mutation.updatedAt = timestamp

    if (this.beforeCreate) {
      await this.beforeCreate(context, query, mutation)
    }

    const item     = await this._create(mutation)
    const document = new this(context, item)

    if (this.afterCreate) {
      await this.afterCreate(context, query, mutation, document)
    }

    return document
  }

  static async read(context, query, options) {
    const item     = await this._read(query, options)
    const document = new this(context, item)

    return document
  }

  static async index(context, query = {}, options = {}) {
    let { items, ...rest } = await this._index(query, options)

    const objects = items.map(item => new this(context, item))

    return { objects, ...rest }
  }

  static async update(context, query, mutation) {
    mutation = omit(mutation, [ this.idKey, 'createdAt', 'createdBy' ])

    const accountId = get(context, 'identity.accountId')

    if (accountId) {
      mutation.updatedBy = accountId
    }

    const timestamp = new Date().toJSON()
    mutation.updatedAt = timestamp

    if (this.beforeUpdate) {
      await this.beforeUpdate(context, query, mutation)
    }

    const item     = await this._update(query, mutation)
    const document = new this(context, item)

    if (this.afterUpdate) {
      await this.afterUpdate(context, query, mutation, document)
    }

    return document
  }

  static async delete(context, query) {
    if (this.beforeDelete) {
      await this.beforeDelete(context, query)
    }

    await this._delete(query)

    if (this.afterDelete) {
      await this.afterDelete(context, query)
    }
  }

  delete() {
    return this.constructor.delete(this.context, this._getQuery)
  }

  async update(mutation, shouldMutate = false) {
    const document = await this.constructor.update(this.context, this._getQuery, mutation)

    if (shouldMutate) {
      this._attributes = document.attributes
    }

    return document
  }

  get _getQuery() {
    const { idKey } = this.constructor

    return {
      [idKey]: this._attributes[idKey]
    }
  }
}

module.exports = Document
