'use strict'

const config = require('config')
const { Component } = require('test/app/lib')

class Service extends Component {
  static async read() {
    const name    = 'Test'
    const version = '1.0.0'

    const apiVersion = config.get('spec.version')

    return { name, version, apiVersion }
  }
}

module.exports = Service
