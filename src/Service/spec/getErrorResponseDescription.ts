import { get } from 'lodash';

export type Error = {
  code: string;
  description: string;
}

/** Returns description for a number of error responses. */
const getErrorResponseDescription = (errors: Error[]) => {
  return errors
    .map(error =>  {
      const code = get(error, 'code');
      const description = get(error, 'description', 'No error description');

      return `\`${code}\` — ${description}`;
    })
    .join('\n');
};

export default getErrorResponseDescription;
