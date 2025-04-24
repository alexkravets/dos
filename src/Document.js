'use strict'

const { ulid }              = require('ulid')
const Component             = require('./Component')
const getIdPrefix           = require('./helpers/getIdPrefix')
const getComponentTitle     = require('./helpers/getComponentTitle')
const DocumentExistsError   = require('./errors/DocumentExistsError')
const DocumentNotFoundError = require('./errors/DocumentNotFoundError')
const { get, omit, capitalize, cloneDeep } = require('lodash')

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

  static _extendWithPartition(context, parameters) {
    if (!this.getPartition) {
      return
    }

    parameters.partition = this.getPartition(context, parameters)
  }

  static async create(context, query, mutation) {
    /* NOTE: existing document in the context allows to return document without
             duplicate been created */
    const { document: existingDocument } = context

    const skipCreate =
      !!existingDocument && existingDocument.constructor.name === this.name

    if (skipCreate) {
      return existingDocument
    }

    if (!mutation) {
      mutation = query
      query    = {}
    }

    const { validator } = context
    mutation = validator.normalize(mutation, this.id)

    const identitySubjectId = get(context, 'identity.sub')

    if (identitySubjectId) {
      mutation.createdBy = identitySubjectId
    }

    const timestamp = new Date().toJSON()
    mutation.createdAt = timestamp
    mutation.updatedAt = timestamp

    if (this.beforeCreate) {
      await this.beforeCreate(context, query, mutation)
    }

    mutation[this.idKey] = this.createId(mutation)
    this._extendWithPartition(context, mutation)

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
    this._extendWithPartition(context, query)

    const item = await this._read(query, options)

    if (!item) {
      throw new DocumentNotFoundError(this, { query, options })
    }

    const document = new this(context, item)

    return document
  }

  static _read({ id = 'NONE' }) {
    return cloneDeep(get(STORE, `${this.name}.${id}`))
  }

  static async index(context, query = {}, options = {}) {
    this._extendWithPartition(context, query)

    let { items, ...rest } = await this._index(query, options)

    const objects = items.map(item => new this(context, item))

    return { objects, ...rest }
  }

  static _index(query) {
    const filter = item =>
      Object.keys(query).every(key => item[key] === query[key])

    const items = Object
      .values(STORE[this.name] || {})
      .filter(filter)
      .map(cloneDeep)

    return { items, count: items.length }
  }

  static async indexAll(context, query = {}, options = {}) {
    this._extendWithPartition(context, query)

    let { items, ...rest } = await this._indexAll(query, options)

    const objects = items.map(item => new this(context, item))

    return { objects, ...rest }
  }

  static _indexAll(query) {
    return this._index(query)
  }

  static async update(context, query, mutation, originalDocument = null) {
    mutation = omit(mutation, [ this.idKey, 'createdAt', 'createdBy' ])

    const identitySubjectId = get(context, 'identity.sub')

    if (identitySubjectId) {
      mutation.updatedBy = identitySubjectId
    }

    const timestamp = new Date().toJSON()
    mutation.updatedAt = timestamp

    if (this.beforeUpdate) {
      await this.beforeUpdate(context, query, mutation)
    }

    /* NOTE: ensure that document to be updated exists and save it in the
             context so can be referenced in the after action helper */
    if (!originalDocument) {
      originalDocument = await this.read(context, query)
    }

    this._extendWithPartition(context, query)

    const updatedItem = await this._update(query, mutation)

    const document = new this(context, updatedItem)
    document._originalDocument = originalDocument

    if (this.afterUpdate) {
      await this.afterUpdate(context, query, mutation, document)
    }

    return document
  }

  static _update({ id }, mutation) {
    const item = STORE[this.name][id]

    /* istanbul ignore next: not used anymore by update interface as read
                             operation throws an error if document not found */
    if (!item) {
      return false
    }

    STORE[this.name][id] = { ...item, ...mutation }

    return cloneDeep(STORE[this.name][id])
  }

  static async delete(context, query) {
    if (this.beforeDelete) {
      await this.beforeDelete(context, query)
    }

    /* NOTE: ensure that document to be removed exists and save it in the
             context so can be referenced in the after action helper */
    const originalDocument = await this.read(context, query)

    this._extendWithPartition(context, query)

    await this._delete(query, context)

    if (this.afterDelete) {
      await this.afterDelete(context, query, originalDocument)
    }

    return originalDocument
  }

  static _delete({ id }) {
    const item = STORE[this.name][id]

    /* istanbul ignore next: not used anymore by delete interface as read
                             operation throws an error if document not found */
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
    const originalDocument = new this.constructor(this.context, { ...this._attributes })

    const document = await this.constructor.update(this.context, this._query, mutation, originalDocument)

    if (shouldMutate) {
      this._attributes = document._attributes
      this._originalDocument = document._originalDocument
    }

    return document
  }

  get originalDocument() {
    if (!this._originalDocument) {
      throw new Error('Original document is undefined')
    }

    return this._originalDocument
  }

  hasAttributeChanged(attributePath) {
    const { originalDocument } = this

    const originalValue = get(originalDocument.attributes, attributePath)
    const updatedValue = get(this.attributes, attributePath)

    const hasChanged = originalValue !== updatedValue

    return hasChanged
  }

  get _query() {
    const { idKey } = this.constructor

    return {
      [idKey]: this._attributes[idKey]
    }
  }
}

module.exports = Document
