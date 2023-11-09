'use strict'

const asSafeClass = classTarget => {
  // eslint-disable-next-line no-undef
  return new Proxy(classTarget, {
    get(target, prop) {
      const isPropertyDefined = (prop in target)
      const isThen = prop === 'then'

      if (isThen) {
        return undefined
      }

      if (!isPropertyDefined) {
        throw new Error(`Undefined property or method: ${prop}`)
      }

      return target[prop]
    }
  })
}

module.exports = asSafeClass
