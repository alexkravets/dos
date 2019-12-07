'use string'

const Read       = require('../operations/Read')
const Index      = require('../operations/Index')
const Create     = require('../operations/Create')
const Update     = require('../operations/Update')
const Delete     = require('../operations/Delete')
const Operation  = require('../Operation')
const pluralize  = require('pluralize')
const startCase  = require('lodash.startcase')
const capitalize = require('lodash.capitalize')

const DEFAULT_OPERATIONS = { Create, Update, Read, Index, Delete }

const createOperation = (operationClassName, Resource, description = '', options = {}) => {
  const [ operationName, baseClassName = operationClassName ] = operationClassName.split(':')

  const OperationClass = DEFAULT_OPERATIONS[baseClassName] || Operation

  const { name: resourceName } = Resource

  const resourceTitle  = startCase(resourceName)
  const defaultTag     = pluralize(resourceTitle)
  const defaultSummary = capitalize(`${operationName} ${resourceTitle}`)

  options.tags    = options.tags ? options.tags : [ defaultTag ]
  options.summary = options.summary ? options.summary : defaultSummary

  return class extends OperationClass {
    static get tags() {
      return options.tags
    }

    static get summary() {
      return options.summary
    }

    static get description() {
      return description
    }

    static get resource() {
      return Resource
    }
  }
}

module.exports = createOperation
