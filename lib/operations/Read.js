'use strict'

const { Operation } = require('@slatestudio/adept')
const Handler = require('../Handler')
const toLower = require('lodash.tolower')

class Read extends Handler(Operation) {
  static get summary() {
    return `Read ${toLower(this.resourceName)} by ID`
  }

  static get query() {
    return {
      id: {
        description: `${this.resourceName} ID`,
        type:        'string',
        required:    true
      }
    }
  }

  static _verifyActionMethodDefinition() {
    if (this.actionMethodName) {
      const isActionMethodNameDefinedForResource =
        this.resource.prototype[this.actionMethodName]

      if (!isActionMethodNameDefinedForResource) {
        const message = `Operation \`${this.name}\` defines` +
          ` \`${this.resourceName}.${this.actionMethodName}\` as an action` +
          ' method which is not available.'

        throw new Error(message)
      }
    }
  }

  static get responses() {
    this._verifyActionMethodDefinition()

    return {
      'OK': {
        description: `Return ${this.resourceName}`,
        schema: {
          type: 'object',
          properties: {
            data: this.reference(this.output)
          },
          required: [ 'data' ]
        }
      }
    }
  }

  static get actionMethodName() {
    return null
  }

  async action() {
    let object = await this.Model.read(this.context, this.query)

    if (this.constructor.actionMethodName) {
      object = await object[this.constructor.actionMethodName](this.context)
    }

    this.result = { data: object }
  }
}

module.exports = Read
