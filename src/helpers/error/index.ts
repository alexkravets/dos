import maskSecrets from './maskSecrets';
import logOperationError, { type OriginalError, type ErrorAttributes } from './logOperationError';

export {
  maskSecrets,
  logOperationError
};

export type {
  OriginalError,
  ErrorAttributes
};
