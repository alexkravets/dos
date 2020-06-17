'use strict'

const isString     = require('lodash.isstring')
const { parse }    = require('url')
const { v4: uuid } = require('uuid')

const createContext = (service, request) => {
  let httpPath
  let httpMethod

  let { operationId } = request

  if (!operationId) {
    httpPath   = request.path.replace(service.basePath, '')
    httpMethod = (request.method || request.httpMethod).toLowerCase()

    operationId = service.getOperationId(httpMethod, httpPath)
  }

  const context = {
    headers:   {},
    requestId: uuid(),
    validator: service.validator,
    requestReceivedAt: new Date().toISOString(),
    httpPath,
    httpMethod,
    operationId
  }

  for (const name in request.headers) {
    context.headers[name.toLowerCase()] = request.headers[name]
  }

  const { url, queryStringParameters, body } = request

  if (queryStringParameters !== undefined) {
    context.query = queryStringParameters

  } else if (url) {
    context.query = parse(url, true).query

  } else {
    context.query = {}

  }

  if (body) {
    const isJSON = isString(body)

    if (isJSON) {
      context.mutation = JSON.parse(body)

    } else {
      context.mutation = body

    }
  }

  return context
}

module.exports = createContext
