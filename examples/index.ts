'use strict';

// NOTE: Run service example:
// $ npm i --save-dev @kravc/http
// $ ./node_modules/.bin/http ./test/example`

import { Service, type Request } from '../src';
import modules from './operations';

const ROOT_PATH = process.cwd();
const path = `${ROOT_PATH}/examples`;
const url = 'http://localhost:3000/';

const service = new Service(modules, { url, path });

/** Handles request via service. */
const handler = (request: Request) => service.process(request);

export {
  handler,
  service,
};
