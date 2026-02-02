'use strict';

// eslint-disable-next-line jsdoc/require-jsdoc
const isTestEnvironment = () => process.env.NODE_APP_INSTANCE === 'test';

// eslint-disable-next-line jsdoc/require-jsdoc
const logRequest = context => {
  if (isTestEnvironment()) {
    return;
  }

  const {
    operationId,
    query,
    logger,
    mutation,
    requestId,
    headers,
    requestReceivedAt
  } = context;

  const { host } = headers;

  const metadata = {
    host,
    requestId,
    requestReceivedAt,
    query,
  };

  if (mutation) {
    metadata.mutation = mutation;
  }

  logger.info(`${operationId}: ${JSON.stringify(metadata, null, 2)}`);
};

module.exports = logRequest;
