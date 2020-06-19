'use strict'

const startCase  = require('lodash.startcase')
const pluralize  = require('pluralize')
const capitalize = require('lodash.capitalize')

const getResourceName = (Component, isCapitalized = true, isPlural = false) => {
  const { name } = Component

  let resourceName = startCase(name).toLowerCase()

  if (isPlural) {
    resourceName = pluralize(resourceName)
  }

  if (isCapitalized) {
    resourceName = capitalize(resourceName)
  }

  return resourceName
}

module.exports = getResourceName
