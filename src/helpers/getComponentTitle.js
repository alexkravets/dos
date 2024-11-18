'use strict'

const { startCase, capitalize } = require('lodash')
const pluralize = require('pluralize')

const getComponentTitle = (Component, isCapitalized = true, isPlural = false) => {
  const { name } = Component

  let componentTitle = startCase(name).toLowerCase()

  if (isPlural) {
    componentTitle = pluralize(componentTitle)
  }

  if (isCapitalized) {
    componentTitle = capitalize(componentTitle)
  }

  return componentTitle
}

module.exports = getComponentTitle
