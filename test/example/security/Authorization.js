'use strict'

const Security = require('lib/Security')

class Authorization extends Security {
}

module.exports = Operation => class extends Operation {
  static get security() {
    return [
      {
        Authorization: {
          klass: Authorization,
          options: []
        }
      }
    ]
  }
}
