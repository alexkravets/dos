'use strict'

const { startCase, capitalize } = require('lodash')

const defaultSummary = (Component, componentAction) => {
  if (!Component) { return '' }

  const { name } = Component

  const componentTitle = startCase(name).toLowerCase()

  return capitalize(`${componentAction} ${componentTitle}`)
}

module.exports = defaultSummary
