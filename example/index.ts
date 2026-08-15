'use strict';

// NOTE: Run service example:
// $ npm start

import { Service, type Request, type Logger } from '../src';
import operations from './operations';

const url = 'http://localhost:3000';

const logger = process.env.NODE_ENV === 'test'
  ? {
      ...console,
      /** Mock logger dir method to prevent output in tests. */
      dir: () => {},
      /** Mock logger info method to prevent output in tests. */
      info: () => {},
      /** Mock logger error method to prevent output in tests. */
      error: () => {},
    } as Logger
  : console;

const service = new Service(operations, { url, context: { logger } });

/** Handles request via service. */
const handler = (request: Request) => service.process(request);

export {
  url,
  logger,
  handler,
  service,
  operations,
};
