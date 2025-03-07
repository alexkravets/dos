'use strict'

const logRequest = require('./logRequest')
const createContext  = require('./createContext')
const specMiddleware = require('./specMiddleware')

const handler = (service, _createContext = createContext, _middleware = specMiddleware) => {
  return (request, logger) => {
    const context = _createContext(service, request, logger)

    const result = _middleware(service, context)

    if (result) { return result }

    logRequest(context)

    return service.process(context)
  }
}

module.exports = handler
