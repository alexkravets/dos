
export type Error = {
  code: string;
  description: string;
}

/** Returns description for a number of error responses. */
const getErrorResponseDescription = (errors: Error[]) => {
  return errors
    .map(({ code, description }) =>  {
      if (!description) {
        return `\`${code}\``;
      }

      return `\`${code}\` — ${description}`;
    })
    .join('\n');
};

export default getErrorResponseDescription;
