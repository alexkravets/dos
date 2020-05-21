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

const logError = (operationContext, errorPlainObject, originalError) => {
  errorPlainObject.operationContext = maskSecrets(
    pick(operationContext, OPERATION_CONTEXT_FIELDS)
  )

  const log = [ 'OperationError', errorPlainObject ]

  if (originalError.toJSON) {
    errorPlainObject.originalErrorJson = JSON.stringify(originalError, null, 2)

  } else {
    log.push(originalError)

  }

  console.error(...log)
}

module.exports = logError
