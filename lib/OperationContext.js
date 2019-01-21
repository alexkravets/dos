'use strict'

const isString    = require('lodash.isstring')
const isUndefined = require('lodash.isundefined')

class OperationContext {
  constructor(operationId, composer) {
    if (!composer) {
      throw new Error('Composer is not defined while operation context' +
        ` initialization, operationId: ${operationId}`)
    }

    this._context     = { operationId }
    this._composer    = composer
    this._operationId = operationId
  }

  _get(key) {
    const value = this._context[key]

    if (isUndefined(value)) {
      throw new Error(`Operation "${this._operationId}" context is missing` +
        ` value for key "${key}"`)
    }

    return value
  }

  get(keys) {
    if (isString(keys)) {
      return this._get(keys)
    }

    const array = []
    for (const key of keys) {
      const value = this._get(key)
      array.push(value)
    }

    return array
  }

  set(hash) {
    delete hash.operationId
    this._context = { ...this._context, ...hash }
  }

  get composer() {
    return this._composer
  }

  get all() {
    return { ...this._context }
  }
}

module.exports = OperationContext
