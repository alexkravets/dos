'use strict'

const JwtAuthorization = require('./JwtAuthorization')

/* istanbul ignore next */
module.exports = (options = {}) => {
  const requirement = JwtAuthorization.createRequirement(options)
  return [ requirement ]
}
