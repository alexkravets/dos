'use strict'

const { pick }    = require('lodash')
const maskSecrets = require('./maskSecrets')

const OPERATION_CONTEXT_FIELDS = [
  'query',
  'mutation',
  'identity',
  'requestId',
  'operationId',
  'requestReceivedAt'
]

const logError = (context, errorResponse, originalError) => {
  const secureContext = maskSecrets(pick(context, OPERATION_CONTEXT_FIELDS))
  errorResponse.contextJson = JSON.stringify(secureContext, null, 2)

  const log = [ 'OperationError', errorResponse ]

  if (originalError.toJSON) {
    errorResponse.originalErrorJson = JSON.stringify(originalError, null, 2)

  } else {
    log.push(originalError)

  }

  console.error(...log)
}

module.exports = logError
