'use strict'

const Operation       = require('../Operation')
const getResourceName = require('../helpers/getResourceName')

const Create = (Component, componentAction = 'create') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Create" operation' +
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
      return Operation.types.CREATE
    }

    static get errors() {
      const resourceName = getResourceName(this.Component)

      return {
        ...super.errors,
        ResourceExistsError: {
          statusCode:  422,
          description: `${resourceName} could not be created, it already exists`
        }
      }
    }
  }
}

module.exports = Create
