import { get } from 'lodash';
import { parse } from 'url';
import type { QueryMap, Request } from '../../Context';

/** Returns query parameters of a request. */
const getQueryParameters = (request: Request): QueryMap => {
  let parameters = {} as QueryMap;

  const url = get(request, 'url');

  if (url) {
    parameters = parse(url, true).query;
  }

  const queryStringParameters = get(request, 'queryStringParameters');

  if (queryStringParameters) {
    const keys = Object.keys(queryStringParameters);

    for (const key in keys) {
      const value = queryStringParameters[key] as string;
      queryStringParameters[key] = decodeURIComponent(value);
    }

    parameters = queryStringParameters;
  }

  const queryKeys = Object.keys(parameters);

  for (const queryKey of queryKeys) {
    const value = parameters[queryKey] as string;
    const isJsonArray = `${value}`.startsWith('["');

    if (isJsonArray) {
      parameters[queryKey] = JSON.parse(value);
    }
  }

  return parameters;
};

export default getQueryParameters;
