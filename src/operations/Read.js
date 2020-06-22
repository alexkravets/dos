'use strict'

const Operation         = require('../Operation')
const getComponentTitle = require('../helpers/getComponentTitle')

const Read = (Component, componentAction = 'read') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Read" operation' +
      ' function')
  }

  return class extends Operation {
    static get Component() {
      return Component
    }

    static get componentAction() {
      return componentAction
    }

    static get errors() {
      const componentTitle = getComponentTitle(this.Component)

      return {
        ...super.errors,
        DocumentNotFoundError: {
          statusCode:  404,
          description: `${componentTitle} is not found`
        }
      }
    }

    static get query() {
      const componentTitle = getComponentTitle(this.Component)

      return {
        id: {
          description: `${componentTitle} ID`,
          required: true
        }
      }
    }
  }
}

module.exports = Read
