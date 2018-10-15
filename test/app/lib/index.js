'use strict'

const Document = require('lib/Document')
const { Schema, Component } = require('@slatestudio/adept')

const schemas = Schema.load('./test/app/schemas/')

class CustomDocument extends Document {
  static get schemas() {
    return schemas
  }
}

class CustomComponent extends Component {
  static get schemas() {
    return schemas
  }
}

module.exports = {
  Document:  CustomDocument,
  Component: CustomComponent
}
