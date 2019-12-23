'use strict'

const Operation  = require('../Operation')
const pluralize  = require('pluralize')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

module.exports = (Component, componentAction = 'index') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Index" operation' +
      ' function')
  }

  return class extends Operation {
    static get Component() {
      return Component
    }

    static get summary() {
      const { Component: { name }, componentAction } = this
      const componentTitlePlural = pluralize(startCase(name)).toLowerCase()

      return capitalize(`${componentAction} ${componentTitlePlural}`)
    }

    static get componentAction() {
      return componentAction
    }

    static get defaultLimit() {
      return 20
    }

    static get defaultSort() {
      return 'desc'
    }

    static get query() {
      const { Component: { name }, defaultSort, defaultLimit } = this
      const componentTitlePlural = pluralize(startCase(name)).toLowerCase()

      return {
        limit: {
          description: `Limit number of ${componentTitlePlural} to be returned`,
          type:        'integer',
          default:     defaultLimit
        },
        sort: {
          description: 'Sort direction',
          type:        'string',
          enum:        [ 'asc', 'desc' ],
          default:     defaultSort
        },
        exclusiveStartKey: {
          description: `Return ${componentTitlePlural} starting from specific key`,
          type:        'string'
        }
      }
    }

    static get output() {
      const { Component: { schema: { id } } } = this

      return {
        data: {
          type:     'array',
          items:    { $ref: id },
          required: true
        },
        pageInfo: {
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
      }
    }

    async action() {
      const { componentActionMethod } = this.constructor
      const { exclusiveStartKey, limit, sort } = this.query

      delete this.query.sort
      delete this.query.limit
      delete this.query.exclusiveStartKey

      const options = { exclusiveStartKey, limit, sort }
      const result = await componentActionMethod(this.context, this.query, options)

      const { objects: data, count, lastEvaluatedKey } = result

      return {
        data,
        pageInfo: { sort, count, limit, lastEvaluatedKey, exclusiveStartKey }
      }
    }
  }
}
