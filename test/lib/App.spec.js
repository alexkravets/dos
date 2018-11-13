'use strict'

const { expect } = require('chai')

const App     = require('lib/App')
const config  = require('config')
const models  = require('test/app/models')
const modules = require('test/app/api')

let app

describe('App', () => {
  describe('App.constructor(config, models, modules)', () => {
    it('composes app specification', () => {
      models.NoCreateCollectionModel = {}

      app = new App(config, models, modules)
      const { spec } = app

      expect(spec).to.have.property('paths')
    })
  })

  describe('.start()', () => {
    it('starts HTTP server', async() => {
      await app.start()
    })
  })

  describe('.spec', () => {
    it('returns API specification', () => {
      expect(app.spec).to.have.property('paths')
    })
  })

  describe('.serverless', () => {
    it('returns serverless configuration', () => {
      expect(app.serverless).to.have.property('provider')
    })
  })
})
