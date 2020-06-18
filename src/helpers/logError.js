'use strict'

const pick        = require('lodash.pick')
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
  errorResponse.context = maskSecrets(
    pick(context, OPERATION_CONTEXT_FIELDS)
  )

  const log = [ 'OperationError', errorResponse ]

  if (originalError.toJSON) {
    errorResponse.originalErrorJson = JSON.stringify(originalError, null, 2)

  } else {
    log.push(originalError)

  }

  console.error(...log)
}

module.exports = logError
