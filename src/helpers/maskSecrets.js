'use strict'

const isString    = require('lodash.isstring')
const isObject    = require('lodash.isobject')
const cloneDeep   = require('lodash.clonedeep')
const { isArray } = Array

const SECRET_REGEXP = /(password|code|token|authorization|cookie)/i

// NOTE: Theoretically this method can be applied to every log entry. This
//       would require refactor of logger interface.
const maskSecrets = object => {
  for (const key in object) {
    const value = object[key]

    if (isArray(value)) {
      for (const item of value) {
        maskSecrets(item)
      }
      continue
    }

    if (isObject(value)) {
      maskSecrets(value)
      continue
    }

    const shouldContinue = !isString(value)

    if (shouldContinue) { continue }

    if (SECRET_REGEXP.test(key)) {
      object[key] = '[MASKED]'
    }
  }
}

// TODO: Refactor to use transformPlainObject helper:
module.exports = input => {
  const object = cloneDeep(input)

  maskSecrets(object)

  return object
}
