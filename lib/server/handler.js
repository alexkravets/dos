'use strict'

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'authorization,content-type',
  'Access-Control-Allow-Methods': 'GET,PATCH,POST,DELETE',
  'Access-Control-Allow-Origin':  '*'
}

const handler = async(routes, req) => {
  const operationId = req.operationId || req.pathParameters.operationId
  const method = req.method || req.httpMethod
  req.query    = req.query  || req.queryStringParameters

  if (method.toUpperCase() == 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS }
  }

  const operation = routes[`/${operationId}`]

  if (operation) {
    if (operation.method.toUpperCase() === method) {
      const handler = new operation(req)
      let { statusCode, headers, result } = await handler.exec()

      headers = {
        ...CORS_HEADERS,
        ...headers
      }

      const body = JSON.stringify(result, null, 2)
      return { statusCode, body, headers }
    }
  }

  const body = JSON.stringify({
    error: {
      code:    'ROUTE_NOT_FOUND',
      message: `Route not found: ${method} /${operationId}`
    }
  }, null, 2)

  return { statusCode: 404, body }
}

module.exports = handler
