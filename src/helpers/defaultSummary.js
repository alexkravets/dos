'use strict'

const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

const defaultSummary = (Component, componentAction) => {
  if (!Component) { return '' }

  const { name } = Component

  const componentTitle = startCase(name).toLowerCase()

  return capitalize(`${componentAction} ${componentTitle}`)
}

module.exports = defaultSummary
