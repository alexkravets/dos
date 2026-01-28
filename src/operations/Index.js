'use strict';

const { capitalize }    = require('lodash');
const Operation         = require('../Operation');
const getComponentTitle = require('../helpers/getComponentTitle');

// eslint-disable-next-line jsdoc/require-jsdoc
const Index = (Component, componentAction = 'index') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Index" operation' +
      ' function');
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  return class extends Operation {
    // eslint-disable-next-line jsdoc/require-jsdoc
    static get Component() {
      return Component;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get summary() {
      const { Component, componentAction } = this;
      const documentTitle = getComponentTitle(Component, false, true);

      return capitalize(`${componentAction} ${documentTitle}`);
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get componentAction() {
      return componentAction;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get defaultLimit() {
      return 20;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get defaultSort() {
      return 'desc';
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    static get query() {
      const { Component, defaultSort, defaultLimit } = this;
      const documentTitle = getComponentTitle(Component, false, true);

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
      };
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
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
      };
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    async action(parameters) {
      const { exclusiveStartKey, limit, sort, index, ...query } = parameters;
      const options = { exclusiveStartKey, limit, sort, index };

      const { componentActionMethod } = this.constructor;
      const result = await componentActionMethod(this.context, query, options);

      const { objects: data, count, lastEvaluatedKey } = result;

      return {
        pageInfo: { sort, count, limit, lastEvaluatedKey, exclusiveStartKey },
        data
      };
    }
  };
};

module.exports = Index;
