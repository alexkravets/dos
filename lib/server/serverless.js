'use strict'

const pick      = require('lodash.pick')
const cloneDeep = require('lodash.clonedeep')

const build = (config, models, operations) => {
  config = pick(config, [
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

  config             = cloneDeep(config)
  config.functions   = config.functions || {}
  const { basePath } = config.spec

  delete config.spec

  if (operations) {
    // NOTE: Each operation is a function. Consider limit of 200 resources of
    //       AWS Cloud Formation. Each operation should export handler method.
    // =======================================================================
    const fs   = require('fs')
    const path = require('path')

    config.functions = {}

    const rootPath   = process.cwd()
    const sourcePath = `${rootPath}/app/api`

    const read = (dir) =>
      fs.readdirSync(dir)
        .reduce((files, file) =>
          fs.statSync(path.join(dir, file)).isDirectory() ?
            files.concat(read(path.join(dir, file))) :
            files.concat(path.join(dir, file)),
        [])

    const sourceFiles = read(sourcePath)
      .map(path => path.replace(`${rootPath}/`, ''))

    const handlersMaps = {}
    for (const path of sourceFiles) {
      const id      = path.split('/').reverse()[0].replace('.js', '')
      const handler = path.replace('.js', '.handler')
      handlersMaps[id] = handler
    }

    for (const operation of operations) {
      const { id, method, path } = operation
      const http = { method, path: `${basePath}${path}` }

      if (config.authorizer) {
        http.authorizer = Object.assign({}, config.authorizer)
      }

      config.functions[id] = {
        handler: handlersMaps[id],
        events:  [{ http }]
      }
    }

  } else {
    // NOTE: API is a function.
    // ========================
    config.functions.api = {
      handler: 'index.handler',
      events:  []
    }

    for (const method of [ 'get', 'post', 'patch', 'delete', 'options' ]) {
      const http = {
        method,
        path:    `${basePath}/{operationId}`,
        request: { parameters: { paths: { operationId: true } } }
      }

      if (config.authorizer) {
        http.authorizer = Object.assign({}, config.authorizer)
      }

      config.functions.api.events.push({ http })
    }
  }

  if (!config.provider.iamRoleStatements) {
    config.provider.iamRoleStatements = []
  }

  for (const name in models) {
    const { tableName } = models[name]

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

module.exports = { build }
