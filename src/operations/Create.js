'use strict'

const Operation = require('../Operation')

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
      return {
        ...super.errors,
        ResourceExistsError: { status: 'Unprocessable Entity' }
      }
    }
  }
}

module.exports = Create
