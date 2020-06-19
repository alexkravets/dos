'use strict'

class CommonError extends Error {
  constructor(code, message) {
    super(message)

    this._code = code
  }

  get code() {
    return this._code
  }

  get isCommonError() {
    return true
  }
}

module.exports = CommonError
