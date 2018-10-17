'use strict'

const { Profile } = require('test/app/models')

describe('AWS', () => {
  require('./aws/dynamo/Dynamo.spec')
})

require('./App.spec')
require('./Document.spec')

describe('Operations', () => {

  before(async() => await Profile.createCollection())
  after(async() => await Profile.deleteCollection())

  require('./operations/Create.spec')
  require('./operations/Delete.spec')
  require('./operations/Index.spec')
  require('./operations/Read.spec')
  require('./operations/Update.spec')
})
