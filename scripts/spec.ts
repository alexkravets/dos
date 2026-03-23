#!/usr/bin/env ts-node
'use strict';

import { resolve } from 'path';
import { statSync } from 'fs';

const [,, servicePath] = process.argv;

if (!servicePath) {
  process.stderr.write('Usage: specs <path-to-service>\n');
  process.exit(1);
}

let fullPath = resolve(process.cwd(), servicePath);

if (statSync(fullPath).isDirectory()) {
  fullPath = resolve(fullPath, 'index.ts');
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { service } = require(fullPath);

process.stdout.write(JSON.stringify(service.spec, null, 2));
