'use strict'

const Operation       = require('../Operation')
const getComponentTitle = require('../helpers/getComponentTitle')

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
      const documentTitle = getComponentTitle(this.Component)

      return {
        ...super.errors,
        DocumentExistsError: {
          statusCode:  422,
          description: `${documentTitle} could not be created, it already exists`
        }
      }
    }
  }
}

module.exports = Create
