'use strict'

const Component = require('src/Component')

class Health extends Component {
  static read() {
    return { status: 'OK' }
  }
}

module.exports = Health
