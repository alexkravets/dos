'use strict'

const Operation         = require('../Operation')
const getComponentTitle = require('../helpers/getComponentTitle')

const Update = (Component, componentAction = 'update') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Update" operation' +
      ' function')
  }

  return class extends Operation {
    static get Component() {
      return Component
    }

    static get componentAction() {
      return componentAction
    }

    static get type() {
      return Operation.types.UPDATE
    }

    static get errors() {
      const documentTitle = getComponentTitle(this.Component)

      return {
        ...super.errors,
        DocumentNotFoundError: {
          statusCode:  404,
          description: `${documentTitle} is not found`
        }
      }
    }

    static get query() {
      const documentTitle = getComponentTitle(this.Component)

      return {
        id: {
          description: `${documentTitle} ID`,
          required: true
        }
      }
    }
  }
}

module.exports = Update
