'use strict'

const isTestEnvironment = process.env.NODE_APP_INSTANCE === 'test'

const logRequest = context => {
  if (isTestEnvironment) {
    return
  }

  const {
    operationId,
    baseUrl,
    query,
    mutation,
    requestId,
    requestReceivedAt
  } = context

  const metadata = {
    baseUrl,
    requestId,
    requestReceivedAt,
    query,
  }

  if (mutation) {
    metadata.mutation = mutation
  }

  console.log(operationId, metadata)
}

module.exports = logRequest
