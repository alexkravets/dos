'use strict';

// eslint-disable-next-line jsdoc/require-jsdoc
const getSuccessStatusCode = ({ outputSchema, types, type }) => {
  if (!outputSchema) {
    return '204';
  }

  if (type === types.CREATE) {
    return '201';
  }

  return '200';
};

module.exports = getSuccessStatusCode;
