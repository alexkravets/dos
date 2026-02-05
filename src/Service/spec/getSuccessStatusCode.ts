
/** Returns HTTP success status code for an operation type and output schema. */
const getSuccessStatusCode = (isCreate: boolean, hasOutput: boolean) => {
  if (!hasOutput) {
    return '204';
  }

  if (isCreate) {
    return '201';
  }

  return '200';
};

export default getSuccessStatusCode;
