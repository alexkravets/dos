import { isString } from 'lodash';
import type { MutationMap, Request } from './Request';

/** Returns mutation parameters of a request. */
const getMutationParameters = (request: Request) => {
  const result = {
    bodyJson: null,
    mutation: null,
  } as {
    bodyJson: string | null;
    mutation: MutationMap | null;
  };

  const { body } = request;

  if (!body) {
    return result;
  }

  const isJSON = isString(body);

  if (isJSON) {
    result.bodyJson = body;
    result.mutation = JSON.parse(body);

    return result;
  }

  result.bodyJson = JSON.stringify(body);
  result.mutation = body;

  return result;
};

export default getMutationParameters;
