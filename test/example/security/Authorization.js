'use strict'

const Security = require('src/Security')

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
