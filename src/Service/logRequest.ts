import type { Context, QueryMap, MutationMap } from '../Context';

type RequestMetadata = {
  host: string;
  requestId: string;
  requestReceivedAt: string;
  query: QueryMap;
  mutation?: MutationMap;
};

/** Logs request metadata in the non test environment. */
const logRequest = (context: Context) => {
  const { isTest } = context;

  if (isTest) {
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
  } as RequestMetadata;

  if (mutation) {
    metadata.mutation = mutation;
  }

  logger.info(`${operationId}: ${JSON.stringify(metadata, null, 2)}`);
};

export default logRequest;
