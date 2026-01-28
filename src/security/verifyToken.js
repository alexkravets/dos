'use strict';

const { verify } = require('jsonwebtoken');

// eslint-disable-next-line jsdoc/require-jsdoc
const verifyToken = async (context, token, publicKey, algorithm) => {
  try {
    await verify(token, publicKey, { algorithms: [ algorithm ] });

  } catch (verificationError) {
    return [ false, verificationError.message ];

  }

  return [ true ];
};

module.exports = verifyToken;
