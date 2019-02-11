'use strict'

const omit       = require('lodash.omit')
const Schema     = require('./Schema')
const cloneDeep  = require('lodash.clonedeep')
const Component  = require('./Component')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

class Document extends Component {
  static get bodySchema() {
    return this._bodySchema
  }

  static createSchema(schemas) {
    const documentName = startCase(this.name).toLowerCase()

    this._bodySchema = schemas[this.name] || new Schema(this.name, {})
    this._schema = this.bodySchema.clone(this.id, {
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
    })

    return this._schema
  }

  static async index(context, query = {}, options = {}) {
    let { docs, ...rest } = await this._index(query, options)

    const objects = docs.map(doc => new this(context, doc))

    return { objects, ...rest }
  }

  static async create(context, query, attributes) {
    const { composer } = context
    this.bodySchema.populateDefaultValues(attributes, composer.schemas)

    const { userId } = context.all

    if (userId) {
      attributes.createdBy = userId
    }

    if (this.beforeCreate) { await this.beforeCreate(context, attributes) }

    await this._create(attributes)
    const object = new this(context, attributes)

    if (this.afterCreate) { await this.afterCreate(context, object) }

    return object
  }

  static async read(context, query, options) {
    const doc    = await this._read(query, options)
    const object = new this(context, doc) // NOSONAR

    return object
  }

  static async update(context, query, attributes) {
    attributes = omit(attributes, [ 'id', 'createdAt', 'createdBy' ])

    if (this.beforeUpdate) { await this.beforeUpdate(context, query, attributes) }

    const { userId } = context.all

    if (userId) {
      attributes.updatedBy = userId
    }

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

  async save(parameters = {}) {
    const isCreated  = !!this.id
    const attributes = Object.assign(cloneDeep(this.attributes), cloneDeep(parameters))

    let object

    if (isCreated) {
      object = await this.constructor.update(this.context, { id: this.id }, attributes)

    } else {
      object = await this.constructor.create(this._context, {}, attributes)

    }

    this._attributes = object.attributes
  }
}

module.exports = Document
