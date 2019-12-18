'use strict'

const Operation  = require('../Operation')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

module.exports = (Component, componentAction = 'read') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Read" operation' +
      ' function')
  }

  if (!Component[componentAction]) {
    throw new Error('Component action method' +
      ` "${Component.name}.${componentAction}(context, query, options)" is` +
      ' not defined')
  }

  return class extends Operation {
    static get Component() {
      return Component
    }

    static get componentAction() {
      return componentAction
    }

    static get errors() {
      return {
        ...super.errors,
        ResourceNotFoundError: { status: 'Not Found' }
      }
    }

    static get query() {
      const { Component: { name } } = this
      const componentTitle = capitalize(startCase(name))

      return {
        id: {
          description: `${componentTitle} ID`,
          type:        'string',
          required:    true
        }
      }
    }
  }
}
