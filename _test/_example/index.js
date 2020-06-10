'use strict'

const App         = require('src/App')
const config      = require('config')
const operations  = require('test/example/api')
const schemasPath = './test/example/schemas'

const app = new App(schemasPath, { operations, config })

module.exports = app
