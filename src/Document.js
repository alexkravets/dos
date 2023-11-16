'use strict'

const get                   = require('lodash.get')
const omit                  = require('lodash.omit')
const { ulid }              = require('ulid')
const Component             = require('./Component')
const capitalize            = require('lodash.capitalize')
const getIdPrefix           = require('./helpers/getIdPrefix')
const getComponentTitle     = require('./helpers/getComponentTitle')
const DocumentExistsError   = require('./errors/DocumentExistsError')
const DocumentNotFoundError = require('./errors/DocumentNotFoundError')

const STORE = {}

class Document extends Component {
  static get idKey() {
    return 'id'
  }

  static get idKeyPrefix() {
    return getIdPrefix(this.name)
  }

  static createId(attributes) {
    if (attributes[this.idKey]) { return attributes[this.idKey] }

    return `${this.idKeyPrefix}_` + ulid()
  }

  static get bodySchema() {
    return this._bodySchema
  }

  static get schema() {
    return this._schema
  }

  static set schema(schema) {
    const documentTitle = getComponentTitle(this, false)

    this._schema = schema.extend({
      id: {
        description: capitalize(documentTitle) + ' ID',
        required:    true
      },
      createdAt: {
        description: `Date and time when ${documentTitle} was created`,
        format:      'date-time',
        required:    true
      },
      updatedAt: {
        description: `Date and time when ${documentTitle} was updated`,
        format:      'date-time'
      },
      createdBy: {
        description: `ID of a user who created ${documentTitle}`
      },
      updatedBy: {
        description: `ID of a user who updated ${documentTitle}`
      }
    }, this.id)

    this._bodySchema = schema
  }

  static async create(context, query, mutation) {
    const { document: existingDocument } = context

    if (existingDocument) {
      return existingDocument
    }

    if (!mutation) {
      mutation = query
      query    = {}
    }

    const { validator } = context
    mutation = validator.normalize(mutation, this.id)

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

    mutation[this.idKey] = this.createId(mutation)

    const isCreated = await this._create(mutation)

    if (!isCreated) {
      throw new DocumentExistsError(this, { query, mutation })
    }

    const document = new this(context, mutation)

    if (this.afterCreate) {
      await this.afterCreate(context, query, mutation, document)
    }

    return document
  }

  static _create(attributes) {
    STORE[this.name] = STORE[this.name] || {}

    const item = STORE[this.name][attributes.id]

    if (!item) {
      STORE[this.name][attributes.id] = attributes

      return true
    }

    return false
  }

  static async read(context, query, options) {
    const item = await this._read(query, options)

    if (!item) {
      throw new DocumentNotFoundError(this, { query, options })
    }

    const document = new this(context, item)

    return document
  }

  static _read({ id = 'NONE' }) {
    return STORE[this.name][id]
  }

  static async index(context, query = {}, options = {}) {
    let { items, ...rest } = await this._index(query, options)

    const objects = items.map(item => new this(context, item))

    return { objects, ...rest }
  }

  static _index() {
    const items = Object.values(STORE[this.name] || {})

    return { items, count: items.length }
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

    const updatedItem = await this._update(query, mutation)

    if (!updatedItem) {
      throw new DocumentNotFoundError(this, { query })
    }

    const document = new this(context, updatedItem)

    if (this.afterUpdate) {
      await this.afterUpdate(context, query, mutation, document)
    }

    return document
  }

  static _update({ id = 'NONE' }, mutation) {
    const item = STORE[this.name][id]

    if (!item) {
      return false
    }

    STORE[this.name][id] = { ...item, ...mutation }

    return STORE[this.name][id]
  }

  static async delete(context, query) {
    if (this.beforeDelete) {
      await this.beforeDelete(context, query)
    }

    const isDeleted = await this._delete(query)

    if (!isDeleted) {
      throw new DocumentNotFoundError(this, { query })
    }

    if (this.afterDelete) {
      await this.afterDelete(context, query)
    }
  }

  static _delete({ id = 'NONE' }) {
    const item = STORE[this.name][id]

    if (!item) {
      return false
    }

    delete STORE[this.name][id]

    return true
  }

  static async reset() {
    return this._reset()
  }

  static _reset() {
    STORE[this.name] = null
  }

  delete() {
    return this.constructor.delete(this.context, this._query)
  }

  async update(mutation, shouldMutate = false) {
    const document = await this.constructor.update(this.context, this._query, mutation)

    if (shouldMutate) {
      this._attributes = document.attributes
    }

    return document
  }

  get _query() {
    const { idKey } = this.constructor

    return {
      [idKey]: this._attributes[idKey]
    }
  }
}

module.exports = Document
