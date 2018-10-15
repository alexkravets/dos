'use strict'

const { expect } = require('chai')

const App     = require('lib/App')
const config  = require('config')
const models  = require('test/app/models')
const modules = require('test/app/api')

let app

describe('App', () => {
  it('App.constructor(config, models, modules)', () => {
    app = new App(config, models, modules)
    const { spec } = app

    expect(spec).to.have.property('paths')
  })
})
