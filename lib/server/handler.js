'use strict'

const handler = async(routes, req) => {
  const operationId = req.operationId || req.pathParameters.operationId
  const method = req.method || req.httpMethod
  req.query    = req.query  || req.queryStringParameters

  const operation = routes[`/${operationId}`]

  if (operation) {
    if (operation.method.toUpperCase() === method) {
      const handler = new operation(req)
      const { statusCode, headers, result } = await handler.exec()

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
