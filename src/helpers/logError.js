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
  const { logger } = context

  errorResponse.context = maskSecrets(pick(context, OPERATION_CONTEXT_FIELDS))

  let unexpectedErrorMessage = ''

  if (originalError.toJSON) {
    errorResponse.originalError = originalError

  } else {
    unexpectedErrorMessage = `, Unexpected ${originalError.stack}`
  }

  const errorResponseJson = JSON.stringify(errorResponse, null, 2)
  logger.error(`OperationError ${errorResponseJson}${unexpectedErrorMessage}`)
}

module.exports = logError
