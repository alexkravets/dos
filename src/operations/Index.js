'use strict'

const Operation  = require('../Operation')
const pluralize  = require('pluralize')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

const Index = (Component, componentAction = 'index') => {
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
          enum:        [ 'asc', 'desc' ],
          default:     defaultSort
        },
        exclusiveStartKey: {
          description: `Return ${componentTitlePlural} starting from specific key`
        }
      }
    }

    static get output() {
      return {
        data: {
          items: { $ref: this.Component.schema.id },
          required: true
        },
        pageInfo: {
          required: true,
          properties: {
            exclusiveStartKey: {
              description: 'Exclusive start key specified in the request'
            },
            lastEvaluatedKey: {
              description: 'Last evaluated key to get next portion of results'
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
              enum:        [ 'asc', 'desc' ]
            }
          }
        }
      }
    }

    async action(input) {
      const { exclusiveStartKey, limit, sort, ...query } = input
      const options = { exclusiveStartKey, limit, sort }

      const { componentActionMethod } = this.constructor
      const result = await componentActionMethod(this.context, query, options)

      const { objects: data, count, lastEvaluatedKey } = result

      return {
        pageInfo: { sort, count, limit, lastEvaluatedKey, exclusiveStartKey },
        data
      }
    }
  }
}

module.exports = Index
