import { Validator } from '@kravc/schema';

export type Logger = {
  error: (message: string) => void;
}

export type Headers = Record<string, unknown>;

export type Context = {
  logger: Logger;
  headers: Headers;
  validator: Validator;
}
