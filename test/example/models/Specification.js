'use strict'

const Schema    = require('lib/Schema')
const Component = require('lib/Component')

class Specification extends Component {
  static get schema() {
    return this._schema
  }

  static createSchema() {
    this._schema = new Schema('Specification', {})
    return this._schema
  }

  static async read(context) {
    const { spec } = context.composer
    return spec
  }
}

module.exports = Specification
