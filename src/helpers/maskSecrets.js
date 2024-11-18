'use strict'

const { isObject, cloneDeep } = require('lodash')
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

    const isSecret = SECRET_REGEXP.test(key)

    if (isSecret) {
      object[key] = '[MASKED]'
    }
  }
}

module.exports = input => {
  const object = cloneDeep(input)

  maskSecrets(object)

  return object
}
