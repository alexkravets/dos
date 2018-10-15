'use strict'

const models = require('test/app/models')

before(async() => {
  for (const name in models) {
    const model = models[name]

    if (model.createCollection) {
      await model.createCollection()
    }
  }
})

after(async() => {
  for (const name in models) {
    const model = models[name]

    if (model.createCollection) {
      await model.deleteCollection()
    }
  }
})

describe('AWS', () => {
  require('./aws/dynamo/Dynamo.spec')
})

require('./App.spec')

describe('Operations', () => {
  require('./operations/Create.spec')
  require('./operations/Delete.spec')
  require('./operations/Index.spec')
  require('./operations/Read.spec')
  require('./operations/Update.spec')
})
