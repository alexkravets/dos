'use strict'

const { parse } = require('url')
const { v4: uuid } = require('uuid')
const { get, isString } = require('lodash')

const createContext = (service, request, extraContext = {}) => {
  const { logger = console } = extraContext

  let httpPath
  let httpMethod

  let { operationId } = request

  if (!operationId) {
    let { path } = request

    if (!path) {
      const { url } = request
      path = parse(url, true).pathname
    }

    const { basePath } = service

    httpPath   = path.replace(basePath, '/')
    httpMethod = (request.method || request.httpMethod).toLowerCase()

    operationId = service.getOperationId(httpMethod, httpPath)
  }

  const requestId = get(request, 'requestContext.requestId', uuid())

  const context = {
    headers:   {},
    baseUrl:   service.baseUrl,
    validator: service.validator,
    requestReceivedAt: new Date().toISOString(),
    logger,
    httpPath,
    requestId,
    httpMethod,
    operationId,
    ...extraContext,
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
    const keys = Object.keys(queryStringParameters)

    for (const key in keys) {
      queryStringParameters[key] = decodeURIComponent(queryStringParameters[key])
    }

    context.query = queryStringParameters
  }

  const queryKeys = Object.keys(context.query)

  for (const queryKey of queryKeys) {
    const value = context.query[queryKey]

    const isJsonArray = `${value}`.startsWith('["')

    if (isJsonArray) {
      context.query[queryKey] = JSON.parse(value)
    }
  }

  if (body) {
    const isJSON = isString(body)

    if (isJSON) {
      context.bodyJson = body
      context.mutation = JSON.parse(body)

    } else {
      context.mutation = body

    }
  }

  return context
}

module.exports = createContext
