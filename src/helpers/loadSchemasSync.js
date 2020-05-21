'use strict'

const endsWith        = require('lodash.endswith')
const { Schema }      = require('@kravc/schema')
const { readdirSync } = require('fs')

const loadSchemasSync = path => {
  return readdirSync(path)
    .filter(fileName => endsWith(fileName, '.yaml'))
    .map(fileName => `${path}/${fileName}`)
    .map(schemaPath => Schema.loadSync(schemaPath))
}

module.exports = loadSchemasSync
