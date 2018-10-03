'use strict'

const handler = async(routes, req) => {
  const { operationId } = req.pathParameters
  const path   = `/${operationId}`
  const method = req.httpMethod

  req.query    = req.queryStringParameters
  req.mutation = req.body

  const operation = routes[path]

  if (operation) {
    if (operation.method.toUpperCase() === method) {
      const handler = new operation(req)
      const { statusCode, headers, result } = await handler.exec()

      const body = JSON.stringify(result)
      return { statusCode, body, headers }
    }
  }

  const statusCode = 404
  const body = JSON.stringify({
    status:  'Not Found',
    name:    'RouteNotFound',
    message: `Route not found: ${method} ${path}`,
    statusCode
  })

  return { statusCode, body }
}

module.exports = { handler }
