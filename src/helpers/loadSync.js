'use strict'

const { load }   = require('js-yaml')
const { Schema } = require('@kravc/schema')
const { readFileSync } = require('fs')

const loadSync = (yamlPath) => {
  const id     = yamlPath.split('.')[0].split('/').reverse()[0]
  const source = load(readFileSync(yamlPath))

  return new Schema(source, id)
}

module.exports = loadSync
