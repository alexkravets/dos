'use strict'

const CommonError = require('./CommonError')
const getComponentTitle = require('../helpers/getComponentTitle')

class DocumentNotFoundError extends CommonError {
  constructor(Document, parameters) {
    const documentTitle  = getComponentTitle(Document)
    const jsonParameters = JSON.stringify(parameters, null, 2)

    super('DocumentNotFoundError', `${documentTitle} not found ${jsonParameters}`)
  }
}

module.exports = DocumentNotFoundError
