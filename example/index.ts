'use strict';

// NOTE: Run service example:
// $ npm i --save-dev @kravc/http
// $ ./node_modules/.bin/http ./examples`

import { Service, type Request, type Logger } from '../src';
import operations from './operations';

const ROOT_PATH = process.cwd();
const path = `${ROOT_PATH}/example`;
const url = 'http://localhost:3000';

const logger = {
  ...console,
  /** Mock logger dir method to prevent output in tests. */
  dir: () => {},
  /** Mock logger info method to prevent output in tests. */
  info: () => {},
  /** Mock logger error method to prevent output in tests. */
  error: () => {},
} as Logger;

const service = new Service(operations, { url, path, context: { logger } });

/** Handles request via service. */
const handler = (request: Request) => service.process(request);

export {
  url,
  path,
  logger,
  handler,
  service,
  operations,
};
