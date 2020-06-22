'use strict'

const CommonError = require('./CommonError')
const getComponentTitle = require('../helpers/getComponentTitle')

class DocumentExistsError extends CommonError {
  constructor(Document, parameters) {
    const documentTitle  = getComponentTitle(Document)
    const jsonParameters = JSON.stringify(parameters, null, 2)

    super('DocumentExistsError', `${documentTitle} already exists ${jsonParameters}`)
  }
}

module.exports = DocumentExistsError
