import { Validator } from '@kravc/schema';

export type Logger = {
  error: (message: string) => void;
}

export type Context = {
  logger: Logger;
  validator: Validator;
}
