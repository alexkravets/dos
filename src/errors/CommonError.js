'use strict'

class CommonError extends Error {
  constructor(code, message, context) {
    super(message)

    this._code    = code
    this._context = context
  }

  get code() {
    return this._code
  }

  get context() {
    return this._context
  }
}

module.exports = CommonError
