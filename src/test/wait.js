'use strict'

const wait = ms => new global.Promise(resolve => setTimeout(resolve, ms))

module.exports = wait
