import { get } from 'lodash';
import type { QueryMap, Request } from './Request';

const BASE_URL = 'http://localhost:3000';

/** Returns query parameters of a request. */
const getQueryParameters = (request: Request): QueryMap => {
  let parameters = {} as QueryMap;

  const url = get(request, 'url');

  if (url) {
    const { searchParams } = new URL(url, BASE_URL);
    parameters = Object.fromEntries(searchParams);
  }

  const queryStringParameters = get(request, 'queryStringParameters');

  if (queryStringParameters) {
    const keys = Object.keys(queryStringParameters);

    for (const key of keys) {
      const value = queryStringParameters[key] as string;
      queryStringParameters[key] = decodeURIComponent(value);
    }

    parameters = queryStringParameters;
  }

  const queryKeys = Object.keys(parameters);


  for (const queryKey of queryKeys) {
    const value = parameters[queryKey] as string;
    const isArrayOfStrings = `${value}`.startsWith('["');

    if (isArrayOfStrings) {
      parameters[queryKey] = JSON.parse(`${value}`);
    }
  }

  return parameters;
};

export default getQueryParameters;
