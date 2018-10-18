'use strict'

const { Operation } = require('@slatestudio/adept')
const toLower = require('lodash.tolower')
const Handler = require('../Handler')

class Create extends Handler(Operation) {
  static get summary() {
    return `Create ${toLower(this.resourceName)}`
  }

  static get mutation() {
    return this.resource
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
      'Created': {
        description: `${this.resourceName} created`,
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
    const Model = this.constructor.resource
    this.status = this.status || 'Created'

    let data
    if (this.constructor.actionMethodName) {
      data = await Model.prototype[this.constructor.actionMethodName](this.context, this.mutation)

    } else {
      data = await Model.create(this.context, this.mutation)
    }

    this.result = { data }
  }
}

module.exports = Create
