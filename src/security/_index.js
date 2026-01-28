'use strict';

const JwtAuthorization = require('./JwtAuthorization');

/* istanbul ignore next */
// eslint-disable-next-line jsdoc/require-jsdoc
module.exports = (options = {}) => {
  const requirement = JwtAuthorization.createRequirement(options);
  return [ requirement ];
};
