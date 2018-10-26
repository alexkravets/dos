'use strict'

describe('AWS', () => {
  require('./lib/aws/dynamo/Dynamo.spec')
})

require('./lib/Document.spec')

describe('Operations', () => {
  const { Profile } = require('test/app/models')
  const api = require('test/app/api')

  before(() => Profile.createCollection())
  after(() => Profile.deleteCollection())

  before(() => {
    for (const module of api) {
      for (const operationId in module) {
        const _Operation = module[operationId]
        _Operation.buildValidators()
      }
    }
  })

  require('./lib/operations/BaseOperation.spec')
  require('./lib/operations/Create.spec')
  require('./lib/operations/Delete.spec')
  require('./lib/operations/Index.spec')
  require('./lib/operations/Read.spec')
  require('./lib/operations/Update.spec')
})

require('./lib/Handler.spec')
require('./lib/App.spec')
