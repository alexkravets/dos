'use strict'

const JWT = require('jsonwebtoken')
const { privateKey: PRIVATE_KEY } = require('./keys')

const createAccessToken = (options, attributes) => {
  const {
    algorithm  = 'RS256',
    privateKey = PRIVATE_KEY,
    ...jwtOptions
  } = options

  const payload = {
    sub:       'SESSION_ID',
    accountId: 'ACCOUNT_ID',
    ...attributes
  }

  const token = JWT.sign(payload, privateKey, { algorithm, ...jwtOptions })

  return token
}

module.exports = createAccessToken
