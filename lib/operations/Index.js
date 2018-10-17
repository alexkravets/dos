'use strict'

const { Operation } = require('@slatestudio/adept')
const Handler = require('../Handler')
const toLower = require('lodash.tolower')

class Index extends Handler(Operation) {
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

  static get responses() {
    return {
      'OK': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type:  'array',
              items: this.reference(this.output),
            },
            meta: {
              type:       'object',
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
          },
          required: [ 'data', 'meta' ]
        }
      }
    }
  }

  async _initialize() {
    await super._initialize()

    this.limit             = this.query.limit
    this.exclusiveStartKey = this.query.exclusiveStartKey
    this.sort              = this.query.sort
    this.query             = this.query.filter || {}
  }

  async action() {
    const { exclusiveStartKey, limit, sort, query } = this
    const {
      objects,
      count,
      lastEvaluatedKey
    } = await this.Model.index(query, {
      exclusiveStartKey,
      limit,
      sort
    })

    this.result = {
      data: objects,
      meta: {
        exclusiveStartKey,
        limit,
        lastEvaluatedKey,
        count
      }
    }
  }
}

module.exports = Index
