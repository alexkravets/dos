'use strict'

const isString  = require('lodash.isstring')
const { parse } = require('url')
const OperationError = require('./OperationError')

class Router {
  static get CORS_HEADERS() {
    return {
      'Access-Control-Allow-Headers': 'authorization,content-type',
      'Access-Control-Allow-Methods': 'GET,PATCH,POST,DELETE',
      'Access-Control-Allow-Origin':  '*'
    }
  }

  constructor(basePath, operations, composer) {
    this._routes   = {}
    this._composer = composer
    this._basePath = basePath == '/' ? '' : basePath

    for (const Operation of operations) {
      const { path } = Operation
      this._routes[path] = Operation
    }
  }

  _method(req) {
    return (req.method || req.httpMethod).toLowerCase()
  }

  _path(req) {
    return req.path.replace(this._basePath, '') || '/'
  }

  _operation(path) {
    return this._routes[path]
  }

  _query(req) {
    if (req.queryStringParameters !== undefined) { return req.queryStringParameters }

    return parse(req.url, true).query
  }

  _mutation(req) {
    if (!req.body) { return }

    return JSON.parse(req.body)
  }

  async process(req) {
    const path   = this._path(req)
    const method = this._method(req)

    const isCorsRequest = (method == 'options')
    if (isCorsRequest) {
      return { statusCode: 204, headers: Router.CORS_HEADERS }
    }

    const Operation = this._operation(path)

    if (Operation) {
      if (Operation.method == method) {
        req.query    = this._query(req)
        req.mutation = this._mutation(req)

        const operation = new Operation({ req, composer: this._composer })
        let { statusCode, headers, result: body } = await operation.exec()

        headers = {
          ...Router.CORS_HEADERS,
          ...headers
        }

        if (!isString(body)) {
          body = JSON.stringify(body, null, 2)
        }

        return { statusCode, headers, body }
      }
    }

    const error = new OperationError({}, 'Not Found', {
      code:    'OperationNotFound',
      message: `Operation not found, route: ${method} ${path}`
    })

    const body = JSON.stringify(error, null, 2)
    return { statusCode: 404, body }
  }
}

module.exports = Router
