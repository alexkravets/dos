'use strict'

const yaml = require('js-yaml')
const Http = require('./server/Http')
const serverless   = require('./server/serverless')
const { Composer } = require('@slatestudio/adept')

class App {
  constructor(config, models, modules) {
    this.config = config
    this.models = models
    this.routes = {}

    const { spec } = config
    const basePath = `/${config.provider.stage}${spec.basePath}`
    const options  = Object.assign({ modules }, spec, { basePath })

    const composer  = new Composer(options)
    this.spec       = composer.spec
    this.operations = composer.operations

    for (const operation of this.operations) {
      this.routes[operation.path] = operation
    }
  }

  async _createCollections() {
    for (const name in this.models) {
      const model = this.models[name]

      if (model.createCollection) {
        await model.createCollection()
      }
    }
  }

  async start() {
    await this._createCollections()

    const { basePath, host, info } = this.spec
    const { title } = info
    const port = Number(host.split(':')[1])

    const server = new Http({
      routes: this.routes,
      basePath,
      title,
      host,
      port
    })

    server.listen()
  }

  buildSpec() {
    return yaml.safeDump(this.spec)
  }

  buildServerless() {
    const config = serverless.build(this.config, this.models)
    return yaml.safeDump(config)
  }
}

module.exports = App
