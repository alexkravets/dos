'use strict'

const Operation = require('../Operation')

module.exports = (Component, componentAction = 'create') => {
  if (!Component) {
    throw new Error('Argument "Component" is undefined for "Create" operation' +
      ' function')
  }

  if (!Component[componentAction]) {
    throw new Error('Component action method' +
      ` "${Component.name}.${componentAction}(context, query, attributes)" is` +
      ' not defined')
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
