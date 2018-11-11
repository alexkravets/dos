'use strict'

const toLower       = require('lodash.tolower')
const { Schema }    = require('@slatestudio/adept')
const BaseOperation = require('./BaseOperation')

class Index extends BaseOperation {
  static get summary() {
    return `List ${toLower(this.collectionName)}`
  }

  static get defaultLimit() {
    return 20
  }

  static get defaultSort() {
    return 'desc'
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
        type:        'string',
        enum:        [ 'asc', 'desc' ],
        default:     this.defaultSort
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
          },
          sort: {
            description: 'Sort direction',
            type:        'string'
          }
        }
      }
    })

    return this._resultSchema
  }

  async action() {
    const { exclusiveStartKey, limit, sort } = this.query

    delete this.query.sort
    delete this.query.limit
    delete this.query.exclusiveStartKey

    const { objects, count, lastEvaluatedKey } = await this.Model
      .index(this.context, this.query, { exclusiveStartKey, limit, sort })

    this.result = {
      data: objects,
      meta: { sort, count, limit, lastEvaluatedKey, exclusiveStartKey }
    }
  }
}

module.exports = Index
