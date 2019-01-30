'use strict'

const Schema    = require('../Schema')
const Operation = require('../Operation')
const startCase = require('lodash.startcase')

class Index extends Operation {
  static get resource() {
    throw new Error(`Operation \`${this.id}\` requires \`resource\` to be defined`)
  }

  static get resourceAction() {
    return 'index'
  }

  static get defaultLimit() {
    return 20
  }

  static get defaultSort() {
    return 'desc'
  }

  static get query() {
    const documentName = startCase(this.resource.name).toLowerCase()

    return {
      limit: {
        description: `Limit number of ${documentName}s to be returned`,
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
        description: `Return ${documentName}s starting from specific key`,
        type:        'string'
      }
    }
  }

  static get outputSchema() {
    return new Schema(`${this.name}Output`, {
      data: {
        type:     'array',
        required: true,
        items: {
          $ref: this.resource.schema.id
        }
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
            type:        'string',
            enum:        [ 'asc', 'desc' ]
          }
        }
      }
    })
  }

  async action() {
    const { resourceActionMethod } = this.constructor
    const { exclusiveStartKey, limit, sort } = this.query

    delete this.query.sort
    delete this.query.limit
    delete this.query.exclusiveStartKey

    const options = { exclusiveStartKey, limit, sort }
    const result = await resourceActionMethod(this.context, this.query, options)

    const { objects: data, count, lastEvaluatedKey } = result

    return {
      data,
      meta: { sort, count, limit, lastEvaluatedKey, exclusiveStartKey }
    }
  }
}

module.exports = Index
