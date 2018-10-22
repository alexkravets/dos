'use strict'

const { Profile } = require('test/app/models')

describe('AWS', () => {
  require('./aws/dynamo/Dynamo.spec')
})

require('./Document.spec')
require('./App.spec')

describe('Operations', () => {

  before(() => Profile.createCollection())
  after(() => Profile.deleteCollection())

  require('./operations/BaseOperation.spec')
  require('./operations/Create.spec')
  require('./operations/Delete.spec')
  require('./operations/Index.spec')
  require('./operations/Read.spec')
  require('./operations/Update.spec')
})
