'use strict'

const fs     = require('fs')
const path   = require('path')
const keyBy  = require('lodash.keyby')
const Router = require('./Router')

class App {
  constructor(composer) {
    this._composer      = composer
    this._router        = new Router(this.basePath, this.operations, composer)
    this._operationsMap = keyBy(this.operations, 'id')
  }

  get composer() {
    return this._composer
  }

  get spec() {
    return this.composer.spec
  }

  get title() {
    return this.spec.info.title
  }

  get basePath() {
    return this.spec.basePath
  }

  get homeOperation() {
    const file = path.resolve(__dirname, '../assets/index.html')
    const html = fs
      .readFileSync(file, { encoding: 'utf8' })
      .replace('$TITLE',       this.title)
      .replace('$SWAGGER_URL', `${this.basePath}/Spec`.replace('//', '/'))

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

  get router() {
    return this._router
  }

  // get host() {
  //   return this.spec.host
  // }

  // get port() {
  //   return Number(this.host.split(':')[1])
  // }

  // async start() {
  //   const { port, router } = this
  //   const server = new Http(port, router)

  //   await server.listen()
  // }
}

module.exports = App
