'use strict'

const { Operation } = require('@slatestudio/adept')
const Handler = require('../Handler')
const toLower = require('lodash.tolower')
const omit    = require('lodash.omit')

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

    this.query = omit(this.query, [ 'limit', 'exclusiveStartKey' ])
  }

  async action() {
    const options = { limit: this.limit, exclusiveStartKey: this.exclusiveStartKey }
    const { objects, count, lastEvaluatedKey } = await this.Model.index(this.context, this.query, options)

    this.result = {
      data: objects,
      meta: {
        exclusiveStartKey: this.exclusiveStartKey,
        limit:             this.limit,
        lastEvaluatedKey,
        count
      }
    }
  }
}

module.exports = Index
