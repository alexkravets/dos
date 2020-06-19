'use strict'

const Operation       = require('../Operation')
const getResourceName = require('../helpers/getResourceName')

const Delete = (Component, componentAction = 'delete') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Delete" operation' +
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
      return Operation.types.DELETE
    }

    static get errors() {
      const resourceName = getResourceName(this.Component)

      return {
        ...super.errors,
        ResourceNotFoundError: {
          statusCode:  404,
          description: `${resourceName} is not found`
        }
      }
    }

    static get query() {
      const resourceName = getResourceName(this.Component)

      return {
        id: {
          description: `${resourceName} ID`,
          required:    true
        }
      }
    }

    static get output() {
      return null
    }
  }
}

module.exports = Delete
