'use strict'

const startCase = require('lodash.startcase')
const pluralize = require('pluralize')

const defaultId = Operation => {
  const { name, Component, componentAction } = Operation

  const isCustom = name !== 'Operation' && name !== ''

  if (isCustom) {
    return name
  }

  if (Component && componentAction) {
    const isIndex    = componentAction === 'index'
    const actionName = startCase(componentAction)

    if (isIndex) {
      const componentTitlePlural = pluralize(startCase(Component.name))
      return `${actionName}${componentTitlePlural}`
    }

    return `${actionName}${Component.name}`
  }

  throw new Error('Operation ID is undefined')
}

module.exports = defaultId
