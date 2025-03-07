'use strict'

const lodash = require('lodash')

/**
 * Returns value by path from the object, throws exception if value not defined.
 * @param {object} object - The object to pull value by path
 * @param {string} path - The path of the value within object
 * @returns {any} A value
 */
const getOrFail = (object, path) => {
  const value = lodash.get(object, path)
  const isUndefined = value === undefined

  /* istanbul ignore else: we should not get here in tests */
  if (!isUndefined) {
    return value
  }

  /* istanbul ignore next: should never be reached at runtime */
  throw Error(`Value is undefined for "${path}"`)
}

module.exports = getOrFail
