'use strict'

const { expect } = require('chai')

const App     = require('lib/App')
const config  = require('config')
const models  = require('test/app/models')
const modules = require('test/app/api')
const { Profile, Book } = models

let app

describe('App', () => {
  after(async() => {
    await Profile.deleteCollection()
    await Book.deleteCollection()
  })

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

  describe('.buildSpec()', () => {
    it('builds YAML specification', () => {
      app.buildSpec()
    })
  })

  describe('.buildServerless()', () => {
    it('builds serverless config', () => {
      app.buildServerless()
    })
  })
})
