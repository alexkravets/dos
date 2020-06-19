'use strict'

const isString     = require('lodash.isstring')
const { parse }    = require('url')
const { v4: uuid } = require('uuid')

const createContext = (service, request) => {
  let httpPath
  let httpMethod

  let { operationId } = request


  if (!operationId) {
    const { url }      = request
    const { basePath } = service

    httpPath   = parse(url, true).pathname.replace(basePath, '/')
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

  context.query = {}

  if (url) {
    context.query = parse(url, true).query
  }

  if (queryStringParameters) {
    context.query = queryStringParameters
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
