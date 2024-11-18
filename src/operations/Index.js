'use strict'

const { capitalize }    = require('lodash')
const Operation         = require('../Operation')
const getComponentTitle = require('../helpers/getComponentTitle')

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
      const { Component, componentAction } = this
      const documentTitle = getComponentTitle(Component, false, true)

      return capitalize(`${componentAction} ${documentTitle}`)
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
      const { Component, defaultSort, defaultLimit } = this
      const documentTitle = getComponentTitle(Component, false, true)

      return {
        limit: {
          description: `Limit number of ${documentTitle} to be returned`,
          type:        'integer',
          default:     defaultLimit
        },
        sort: {
          description: 'Sort direction',
          enum:        [ 'asc', 'desc' ],
          default:     defaultSort
        },
        exclusiveStartKey: {
          description: `Return ${documentTitle} starting from specific key`
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

    async action(parameters) {
      const { exclusiveStartKey, limit, sort, index, ...query } = parameters
      const options = { exclusiveStartKey, limit, sort, index }

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
