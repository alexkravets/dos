import Operation from '../../Operation';

/** Returns HTTP method for an operation type. */
const getHttpMethod = (type: string) => {
  switch (type) {
    case Operation.types.CREATE:
      return 'post';

    case Operation.types.DELETE:
      return 'delete';

    case Operation.types.UPDATE:
      return 'patch';

    default:
      return 'get';
  }
};

export default getHttpMethod;
