'use strict'

const fs           = require('fs')
const path         = require('path')
const Http         = require('./Http')
const Router       = require('./Router')
const Serverless   = require('./Serverless')
const { Composer } = require('@slatestudio/adept')

class App {
  constructor(config, models, modules, basePath) {
    const { spec } = config
    basePath = basePath || spec.basePath

    const options  = Object.assign({ modules }, spec, { basePath })

    this._basePath   = basePath
    this._composer   = new Composer(options)
    this._router     = new Router(basePath, this.operations)
    this._serverless = new Serverless(config, models)
  }

  get spec() {
    return this._composer.spec
  }

  get title() {
    return this.spec.info.title
  }

  get basePath() {
    return this._basePath
  }

  get home() {
    const file = path.resolve(__dirname, '../assets/index.html')
    const html = fs
      .readFileSync(file, { encoding: 'utf8' })
      .replace('$TITLE',       this.title)
      .replace('$SWAGGER_URL', `${this.basePath}/Spec`)

    return class {
      static get path() {
        return ''
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

  get operations() {
    return this._composer.operations.concat([ this.home ])
  }

  get serverless() {
    return this._serverless.build()
  }

  get host() {
    return this.spec.host
  }

  get port() {
    return Number(this.host.split(':')[1])
  }

  get router() {
    return this._router
  }

  async start() {
    const { port, router } = this
    const server = new Http(port, router)

    await server.listen()
  }
}

module.exports = App
