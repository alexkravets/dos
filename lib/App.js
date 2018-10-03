'use strict'

const yaml = require('js-yaml')
const serverless   = require('./server/serverless')
const { Composer } = require('@slatestudio/adept')

class App {
  constructor(config, models, modules) {
    this.config = config
    this.models = models
    this.routes = {}

    const { spec } = config
    const options  = Object.assign({ modules }, spec)

    const composer  = new Composer(options)
    this.spec       = composer.spec
    this.operations = composer.operations

    for (const operation of this.operations) {
      this.routes[operation.path] = operation
    }
  }

  async createTables() {
    for (const name in this.models) {
      const model = this.models[name]

      if (model.createTable) {
        await model.createTable()
      }
    }
  }

  async http() {
    await this.createTables()

    const Server = require('./server/Http')
    const server = new Server({
      spec:       this.spec,
      operations: this.operations
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
