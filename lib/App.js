'use strict'

const fs        = require('fs')
const path      = require('path')
const keyBy     = require('lodash.keyby')
const Composer  = require('./Composer')
const isString  = require('lodash.isstring')
const { parse } = require('url')
const OperationError = require('./OperationError')

class App {
  static get CORS_HEADERS() {
    return {
      'Access-Control-Allow-Headers': 'authorization,content-type',
      'Access-Control-Allow-Methods': 'GET,PATCH,POST,DELETE',
      'Access-Control-Allow-Origin':  '*'
    }
  }

  constructor(schemasPath, { components, operations, config }) {
    this._composer      = new Composer(schemasPath, { components, operations, config })
    this._operationsMap = keyBy(this.operations, 'id')

    this._routes = {}
    for (const Operation of this.operations) {
      const { path } = Operation
      this._routes[path] = Operation
    }
  }

  get spec() {
    return this._composer.spec
  }

  get title() {
    return this.spec.info ? this.spec.info.title : 'Title Undefined'
  }

  get basePath() {
    const { basePath } = this.spec
    return basePath == '/' ? '' : basePath
  }

  get operations() {
    return [
      ...this._composer.operations,
      this.homeOperation,
      this.specOperation
    ]
  }

  get operationsMap() {
    return this._operationsMap
  }

  get homeOperation() {
    const file = path.resolve(__dirname, '../assets/index.html')
    const html = fs
      .readFileSync(file, { encoding: 'utf8' })
      .replace('$TITLE',       this.title)
      .replace('$SWAGGER_URL', `${this.basePath}/Spec`)

    return class {
      static get path() {
        return '/'
      }

      static get method() {
        return 'get'
      }

      exec() {
        return {
          statusCode: 200,
          headers:    { 'Content-Type': 'text/html; charset=UTF-8' },
          result:     html
        }
      }
    }
  }

  get specOperation() {
    const { spec } = this

    return class {
      static get path() {
        return '/Spec'
      }

      static get method() {
        return 'get'
      }

      exec() {
        return {
          statusCode: 200,
          result:     spec
        }
      }
    }
  }

  _method(req) {
    if (req.operationId) { return null }
    return (req.method || req.httpMethod).toLowerCase()
  }

  _path(req) {
    if (req.operationId) { return `/${req.operationId}` }
    return req.path.replace(this.basePath, '') || '/'
  }

  _operation(path) {
    return this._routes[path]
  }

  _query(req) {
    if (req.queryStringParameters !== undefined) { return req.queryStringParameters }
    if (req.url) { return parse(req.url, true).query }
    return {}
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
      return { statusCode: 204, headers: App.CORS_HEADERS }
    }

    const Operation = this._operation(path)

    if (Operation) {
      const isNoMethod    = method == null
      const isMethodMatch = Operation.method == method

      if (isNoMethod || isMethodMatch) {
        req.query    = this._query(req)
        req.mutation = this._mutation(req)

        const operation = new Operation({ req, composer: this._composer })
        let { statusCode, headers, result } = await operation.exec()

        headers = {
          ...App.CORS_HEADERS,
          ...headers
        }

        const body = isString(result) ? result : JSON.stringify(result, null, 2)
        return { statusCode, headers, body, result }
      }
    }

    const error = new OperationError({}, 'Not Found', {
      code:    'OperationNotFound',
      message: `Operation not found, route: ${method} ${path}`
    })

    const body   = JSON.stringify(error, null, 2)
    const result = error.json

    return { statusCode: 404, body, result }
  }
}

module.exports = App
