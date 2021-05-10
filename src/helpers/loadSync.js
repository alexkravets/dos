'use strict'

const { load }   = require('js-yaml')
const { Schema } = require('@kravc/schema')
const { readFileSync } = require('fs')

const loadSync = (yamlPath) => {
  const id     = yamlPath.split('/').reverse()[0].split('.yaml')[0]
  const source = load(readFileSync(yamlPath))

  return new Schema(source, id)
}

module.exports = loadSync
