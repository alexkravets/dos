'use strict'

const { startCase } = require('lodash')
const pluralize = require('pluralize')

const defaultTags = Component => {
  if (!Component) { return [] }

  const { name } = Component

  const componentTitlePlural = pluralize(startCase(name))

  return [ componentTitlePlural ]
}

module.exports = defaultTags
