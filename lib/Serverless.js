'use strict'

const get       = require('lodash.get')
const pick      = require('lodash.pick')
const cloneDeep = require('lodash.clonedeep')

class Serverless {
  constructor(composer) {
    this._composer = composer
    this._basePath = composer.spec.basePath
  }

  build() {
    const config = pick(cloneDeep(this._composer.config), [
      'service',
      'provider',
      'plugins',
      'custom',
      'package',
      'functions',
      'resources',
      'authorizer'
    ])

    config.functions = config.functions || {}
    config.functions.api = {
      handler: 'index.handler',
      events:  [
        {
          http: {
            method: 'get',
            path:   this._basePath
          }
        }
      ]
    }

    for (const method of [ 'get', 'post', 'patch', 'delete', 'options' ]) {
      const path = `${this._basePath}/{operationId}`.replace('//', '/')
      const http = {
        path,
        method,
        request: {
          parameters: {
            paths: {
              operationId: true
            }
          }
        }
      }

      config.functions.api.events.push({ http })
    }


    config.provider.iamRoleStatements = get(config, 'provider.iamRoleStatements', [])

    for (const name in this._composer.components) {
      const { tableName } = this._composer.components[name]

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
