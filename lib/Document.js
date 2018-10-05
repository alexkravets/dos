'use strict'

const Dynamo  = require('./aws/dynamo')
const { Document: AbstractDocument, Schema } = require('@slatestudio/adept')

const rootPath = process.cwd()
const schemas  = Schema.load(`${rootPath}/app/schemas/`)

class Document extends Dynamo(AbstractDocument) {
  static getSchema(name) {
    return schemas[name]
  }
}

module.exports = Document
