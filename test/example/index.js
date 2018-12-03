'use strict'

const App         = require('lib/App')
const config      = require('config')
const Composer    = require('lib/Composer')
const operations  = require('test/example/operations')
const schemasPath = './test/example/schemas'

const composer = new Composer(schemasPath, { operations, config })
const app = new App(composer)

module.exports = app
