'use strict'

const app      = require('../index')
const config   = require('config')
const isString = require('lodash.isstring')
const { Http } = require('@slatestudio/common-http')

const CORS_HEADERS = {
  'access-control-allow-headers': 'authorization,content-type',
  'access-control-allow-methods': 'GET,PATCH,POST,DELETE',
  'access-control-allow-origin':  '*'
}

const host = config.get('spec.host')
const port = Number(host.split(':')[1])

const handler = async(req) => {
  const isOptionsRequest = (req.method.toLowerCase() === 'options')
  if (isOptionsRequest) {
    return { statusCode: 204, headers: { ...CORS_HEADERS } }
  }

  let { statusCode, headers, result } = await app.process(req)

  headers = { ...headers, ...CORS_HEADERS }

  if (result) {
    const body = isString(result) ? result : JSON.stringify(result, null, 2)
    return { statusCode, headers, body }
  }

  return { statusCode, headers }
}

const start = async() => {
  const server = new Http(port, handler)
  await server.listen()
}

start()
