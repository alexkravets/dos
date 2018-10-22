'use strict'

const OperationError = require('./OperationError')

class DocumentNotFound extends OperationError {
  static get status() {
    return 'Not Found'
  }

  constructor(name) {
    super()
    this._name = name

    // if (error) {
    //   this.originalErrors = [ error ]
    // }
  }

  get message() {
    return `${this._name} document is not found`
  }
}

module.exports = DocumentNotFound
