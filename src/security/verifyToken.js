'use strict'

const { verify } = require('jsonwebtoken')

const verifyToken = async (context, token, publicKey, algorithm) => {
  try {
    await verify(token, publicKey, { algorithms: [ algorithm ] })

  } catch (verificationError) {
    return [ false, verificationError.message ]

  }

  return [ true ]
}

module.exports = verifyToken
