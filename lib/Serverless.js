'use strict'

const pick      = require('lodash.pick')
const cloneDeep = require('lodash.clonedeep')

class Serverless {
  constructor(config, models) {
    this._models = models
    this._config = pick(config, [
      'spec',
      'service',
      'provider',
      'plugins',
      'custom',
      'package',
      'functions',
      'resources',
      'authorizer'
    ])
  }

  build() {
    const config       = cloneDeep(this._config)
    config.functions   = config.functions || {}
    const { basePath } = config.spec

    delete config.spec

    config.functions.api = {
      handler: 'index.handler',
      events:  []
    }

    for (const method of [ 'get', 'post', 'patch', 'delete', 'options' ]) {
      const http = {
        method,
        path: `${basePath}/{operationId}`,
        request: {
          parameters: {
            paths: {
              operationId: true
            }
          }
        }
      }

      if (config.authorizer) {
        http.authorizer = Object.assign({}, config.authorizer)
      }

      config.functions.api.events.push({ http })
    }

    if (!config.provider.iamRoleStatements) {
      config.provider.iamRoleStatements = []
    }

    for (const name in this._models) {
      const { tableName } = this._models[name]

      if (tableName) {
        config.provider.iamRoleStatements.push({
          Effect: 'Allow',
          Action: [
            'dynamodb:Query',
            'dynamodb:Scan',
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem'
          ],
          Resource: [
            `arn:aws:dynamodb:\${opt:region, self:provider.region}:*:table/${tableName}`,
            `arn:aws:dynamodb:\${opt:region, self:provider.region}:*:table/${tableName}/*`
          ]
        })
      }
    }

    return config
  }
}

module.exports = Serverless
