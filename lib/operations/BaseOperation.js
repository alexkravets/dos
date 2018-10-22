'use strict'

const Handler        = require('../Handler')
const OperationError = require('../errors/OperationError')
const { Operation, Schema } = require('@slatestudio/adept')

class BaseOperation extends Handler(Operation) {
  static get defaultError() {
    return OperationError
  }

  static get actionMethodName() {
    return null
  }

  static _verifyInstanceActionMethod() {
    if (this.resource.prototype[this.actionMethodName]) { return }

    const message = `Operation \`${this.name}\` references` +
      ` \`${this.actionMethodName}\` as instance method of ${this.resourceName}` +
      ' resource, but it is not defined.'

    throw new Error(message)
  }

  static _verifyClassActionMethod() {
    if (this.resource[this.actionMethodName]) { return }

    const message = `Operation \`${this.name}\` references` +
      ` \`${this.actionMethodName}\` as class method of ${this.resourceName}` +
      ' resource, but it is not defined.'

    throw new Error(message)
  }

  static buildValidators() {
    super.buildValidators()

    if (this.actionMethodName) {
      if (this.type == this.types.CREATE) {
        this._verifyClassActionMethod()

      } else {
        this._verifyInstanceActionMethod()

      }
    }
  }

  static get resultSchema() {
    if (this._resultSchema) { return this._resultSchema }

    this._resultSchema = new Schema(`${this.name}Result`, {
      data: this.reference(this.output, true)
    })

    return this._resultSchema
  }
}

module.exports = BaseOperation
