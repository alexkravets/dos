'use strict'

const get              = require('lodash.get')
const Composer         = require('./Composer')
const isString         = require('lodash.isstring')
const { parse }        = require('url')
const { resolve }      = require('path')
const OperationError   = require('./OperationError')
const { readFileSync } = require('fs')

class App {
  constructor(schemasPath, { components, operations, config }) {
    this._composer = new Composer(schemasPath, { components, operations, config })

    this._routes = {}
    this._operationsMap = {}

    for (const Operation of this.operations) {
      const { id, method, path } = Operation
      this._routes[`${method}:${path}`] = Operation
      this._operationsMap[id] = Operation
    }

    this._isProductionMode = config.isProductionMode
  }

  get composer() {
    return this._composer
  }

  get spec() {
    return this.composer.spec
  }

  get title() {
    return get(this ,'spec.info.title', 'Service')
  }

  get basePath() {
    const { basePath } = this.spec
    return basePath === '/' ? '' : basePath
  }

  get operations() {
    return [
      ...this.composer.operations,
      this.homeOperation,
      this.specOperation
    ]
  }

  get operationsMap() {
    return this._operationsMap
  }

  get homeOperation() {
    const { title, basePath } = this
    const templatePath = resolve(__dirname, '../assets/index.html')

    return App.createHtmlOperation('/', templatePath, () => ({
      TITLE:       title,
      SWAGGER_URL: `${basePath}/Spec`
    }))
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
    if (req.operationId) { return undefined }
    return (req.method || req.httpMethod).toLowerCase()
  }

  _path(req) {
    if (req.operationId) { return `/${req.operationId}` }
    return req.path.replace(this.basePath, '') || '/'
  }

  _operationId(req) {
    return req.operationId
  }

  _operation(operationId, method, path) {
    if (operationId) { return this._operationsMap[operationId] }
    return this._routes[`${method}:${path}`]
  }

  _query(req) {
    if (req.queryStringParameters !== undefined) { return req.queryStringParameters }
    if (req.url) { return parse(req.url, true).query }
    return {}
  }

  _mutation(req) {
    if (!req.body) { return }

    if (isString(req.body)) {
      return JSON.parse(req.body)
    }

    return req.body
  }

  process(req) {
    const path        = this._path(req)
    const method      = this._method(req)
    const operationId = this._operationId(req)

    const Operation = this._operation(operationId, method, path)

    if (Operation) {
      req.query    = this._query(req)
      req.mutation = this._mutation(req)

      const operation = new Operation({ req, composer: this.composer })
      return operation.exec()
    }

    const error = new OperationError({}, 'Not Found', {
      code:    'OperationNotFound',
      message: `Operation not found, route: ${method} ${path}`
    })

    const result     = error.json
    const headers    = {}
    const statusCode = 404

    return { statusCode, headers, result }
  }

  static createHtmlOperation(path, templatePath, contextFn) {
    let html = readFileSync(templatePath, { encoding: 'utf8' })

    return class {
      static get path() {
        return path
      }

      static get method() {
        return 'get'
      }

      async exec() {
        /* istanbul ignore else: do not reload template in production mode */
        if (!this._isProductionMode) {
          html = readFileSync(templatePath, { encoding: 'utf8' })
        }

        let renderContext = {}

        /* istanbul ignore else: contextFn is not required */
        if (contextFn) {
          renderContext = await contextFn()
        }

        let result = html

        for (const key in renderContext) {
          const value = renderContext[key]
          result = result.replace(`$${key}`, value)
        }

        const headers    = { 'Content-Type': 'text/html; charset=UTF-8' }
        const statusCode = 200

        return { statusCode, headers, result }
      }
    }
  }
}

module.exports = App
