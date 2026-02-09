'use strict';

// NOTE: Run service example:
// $ npm i --save-dev @kravc/http
// $ ./node_modules/.bin/http ./examples`

import { Service, type Request } from '../src';
import operations from './operations';

const ROOT_PATH = process.cwd();
const path = `${ROOT_PATH}/example`;
const url = 'http://localhost:3000/';

const service = new Service(operations, { url, path });

/** Handles request via service. */
const handler = (request: Request) => service.process(request);

export {
  handler,
  service,
};
