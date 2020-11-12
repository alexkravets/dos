'use strict'

const path     = require('path')
const keyBy    = require('lodash.keyby')
const loadSync = require('./loadSync')
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
    .filter(fileName => fileName.endsWith('.yaml'))
    .map(schemaPath => loadSync(schemaPath))

const createSchemasMap = path => {
  const yamlSchemas = readSchemasSync(path)
  const schemasMap  = keyBy(yamlSchemas, 'id')

  return schemasMap
}

module.exports = createSchemasMap
