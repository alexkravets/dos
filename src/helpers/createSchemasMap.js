'use strict'

const path       = require('path')
const uniq       = require('lodash.uniq')
const keyBy      = require('lodash.keyby')
const compact    = require('lodash.compact')
const endsWith   = require('lodash.endswith')
const { Schema } = require('@kravc/schema')
const { readdirSync, statSync } = require('fs')

const ROOT_PATH = process.cwd()

const listFilesSync = dir =>
  readdirSync(dir)
    .reduce((files, file) =>
      statSync(path.join(dir, file)).isDirectory() ?
        files.concat(listFilesSync(path.join(dir, file))) :
        files.concat(path.join(dir, file))
    , [])

const readSchemasSync = path =>
  listFilesSync(ROOT_PATH + path)
    .filter(fileName => endsWith(fileName, '.yaml'))
    .map(schemaPath => Schema.loadSync(schemaPath))

const createSchemasMap = (path, operations, components) => {
  const yamlSchemas = readSchemasSync(path)
  const schemasMap  = keyBy(yamlSchemas, 'id')

  const operationComponents = compact(operations.map(({ Component }) => Component))
  components = uniq([ ...components, ...operationComponents ])

  for (const component of components) {
    if (!component.schema) {
      const schema = schemasMap[component.id]

      if (!schema) {
        throw new Error(`Schema for component "${component.id}" not found`)
      }

      component.schema = schema
    }

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

  return schemasMap
}

module.exports = createSchemasMap
