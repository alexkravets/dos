'use strict'

const path            = require('path')
const uniq            = require('lodash.uniq')
const keyBy           = require('lodash.keyby')
const compact         = require('lodash.compact')
const { Validator }   = require('@kravc/schema')
const OperationError  = require('./errors/OperationError')
const loadSchemasSync = require('./helpers/loadSchemasSync')

const DEFAULT_SCHEMAS_PATH = path.resolve(__dirname) + '/schemas'

class Service {
  constructor(components = [], operations = [], schemasPath = DEFAULT_SCHEMAS_PATH) {
    const yamlSchemas = loadSchemasSync(schemasPath)
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

    const schemas = Object.values(schemasMap)
    this._validator = new Validator(schemas)
  }

  get validator() {
    return this._validator
  }
}

module.exports = Service
