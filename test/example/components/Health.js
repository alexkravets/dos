'use strict'

const Component = require('lib/Component')

class Health extends Component {
  static read() {
    return { status: 'OK' }
  }
}

module.exports = Health
