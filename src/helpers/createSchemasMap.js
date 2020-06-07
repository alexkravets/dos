'use strict'

const path            = require('path')
const uniq            = require('lodash.uniq')
const keyBy           = require('lodash.keyby')
const compact         = require('lodash.compact')
const OperationError  = require('../errors/OperationError')
const loadSchemasSync = require('./loadSchemasSync')

const DEFAULT_SCHEMAS_PATH = path.resolve(__dirname) + '/schemas'

const createSchemasMap = (components, operations) => {
  const yamlSchemas = loadSchemasSync(DEFAULT_SCHEMAS_PATH)
  const schemasMap  = keyBy(yamlSchemas, 'id')

  const operationComponents = compact(operations.map(({ Component }) => Component))
  components = uniq([ ...components, ...operationComponents ])

  for (const component of components) {
    component.schema = schemasMap[component.id]
    schemasMap[component.id] = component.schema
  }

  for (const operationClass of operations) {
    const { mutationSchema, inputSchema, outputSchema } = operationClass

    if (mutationSchema) {
      schemasMap[mutationSchema.id] = mutationSchema
    }

    if (inputSchema) {
      schemasMap[inputSchema.id] = inputSchema
    }

    if (outputSchema) {
      schemasMap[outputSchema.id] = outputSchema
    }
  }

  schemasMap[OperationError.id] = OperationError.schema

  return schemasMap
}

module.exports = createSchemasMap
