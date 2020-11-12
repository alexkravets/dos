'use strict'

const { Schema }       = require('@kravc/schema')
const { safeLoad }     = require('js-yaml')
const { readFileSync } = require('fs')

const loadSync = (yamlPath) => {
  const id     = yamlPath.split('.')[0].split('/').reverse()[0]
  const source = safeLoad(readFileSync(yamlPath))

  return new Schema(source, id)
}

module.exports = loadSync
