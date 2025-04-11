'use strict'

const path      = require('path')
const { keyBy } = require('lodash')
const loadSync  = require('./loadSync')
const { readdirSync, statSync } = require('fs')

const SCHEMA_CLASS_NAME = 'Schema'

const listFilesSync = dir =>
  readdirSync(dir)
    .reduce((files, file) =>
      statSync(path.join(dir, file)).isDirectory() ?
        files.concat(listFilesSync(path.join(dir, file))) :
        files.concat(path.join(dir, file))
    , [])

const readSchemasSync = path =>
  listFilesSync(path)
    .filter(fileName => fileName.endsWith('.yaml'))
    .map(schemaPath => loadSync(schemaPath))

const createSchemasMap = (path, modules) => {
  const yamlSchemas = readSchemasSync(path)
  const schemasMap  = keyBy(yamlSchemas, 'id')

  const schemas = modules
    .filter(item => item.constructor.name === SCHEMA_CLASS_NAME)

  for (const schema of schemas) {
    schemasMap[schema.id] = schema
  }

  return schemasMap
}

module.exports = createSchemasMap
