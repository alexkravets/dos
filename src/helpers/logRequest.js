'use strict'

const isTestEnvironment = process.env.NODE_APP_INSTANCE === 'test'

const logRequest = context => {
  if (isTestEnvironment) {
    return
  }

  const {
    operationId,
    query,
    mutation,
    requestId,
    headers,
    requestReceivedAt
  } = context

  const { host } = headers

  const metadata = {
    host,
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
