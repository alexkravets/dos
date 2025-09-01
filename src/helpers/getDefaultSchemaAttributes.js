'use strict'

const { capitalize } = require('lodash')
const getComponentTitle = require('./getComponentTitle')

const getDefaultSchemaAttributes = (Component) => {
  const documentTitle = getComponentTitle(Component, false)

  return {
    id: {
      description: capitalize(documentTitle) + ' ID',
      required:    true
    },
    createdAt: {
      description: `Date and time when ${documentTitle} was created`,
      format:      'date-time',
      required:    true
    },
    updatedAt: {
      description: `Date and time when ${documentTitle} was updated`,
      format:      'date-time'
    },
    createdBy: {
      description: `ID of a user who created ${documentTitle}`
    },
    updatedBy: {
      description: `ID of a user who updated ${documentTitle}`
    }
  }
}

module.exports = getDefaultSchemaAttributes
