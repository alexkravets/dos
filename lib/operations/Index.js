'use strict'

const toLower       = require('lodash.tolower')
const jsonic        = require('jsonic')
const { Schema }    = require('@slatestudio/adept')
const BaseOperation = require('./BaseOperation')

class Index extends BaseOperation {
  static get summary() {
    return `List ${toLower(this.collectionName)}`
  }

  static get defaultLimit() {
    return 20
  }

  static get query() {
    return {
      limit: {
        description: 'Limit number of results to be returned',
        type:        'integer',
        default:     this.defaultLimit
      },
      sort: {
        description: 'Sort direction',
        type:        'string'
      },
      filter: {
        description: 'Filtering results',
        type:        'string'
      },
      exclusiveStartKey: {
        description: 'Return results starting from specific key',
        type:        'string'
      }
    }
  }

  static get resultSchema() {
    if (this._resultSchema) { return this._resultSchema }

    this._resultSchema = new Schema(`${this.name}Output`, {
      data: {
        type:     'array',
        required: true,
        items:    this.reference(this.output)
      },
      meta: {
        type:       'object',
        required:   true,
        properties: {
          exclusiveStartKey: {
            description: 'Exclusive start key specified in the request',
            type:        'string'
          },
          lastEvaluatedKey: {
            description: 'Last evaluated key to get next portion of results',
            type:        'string'
          },
          limit: {
            description: 'Limit value specified in the request',
            type:        'integer'
          },
          count: {
            description: 'Number of results',
            type:        'integer'
          }
        }
      }
    })

    return this._resultSchema
  }

  async _initialize() {
    await super._initialize()

    this.sort  = this.query.sort
    this.limit = this.query.limit
    this.exclusiveStartKey = this.query.exclusiveStartKey

    try {
      const filter = this.query.filter || ''
      this.query = jsonic(filter) || {}
    } catch (error) {
      this.query = {}
    }
  }

  async action() {
    const { exclusiveStartKey, limit, sort, query } = this

    const { objects, count, lastEvaluatedKey } = await this.Model
      .index(this.context, query, { exclusiveStartKey, limit, sort })

    this.result = {
      data: objects,
      meta: { count, limit, lastEvaluatedKey, exclusiveStartKey }
    }
  }
}

module.exports = Index
