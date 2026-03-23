#!/usr/bin/env node
'use strict';

const { resolve } = require('path');
const { statSync } = require('fs');

const [,, servicePath] = process.argv;

if (!servicePath) {
  process.stderr.write('Usage: spec <path-to-service>\n');
  process.exit(1);
}

let fullPath = resolve(process.cwd(), servicePath);

if (statSync(fullPath).isDirectory()) {
  fullPath = resolve(fullPath, 'index.js');
}

const { service } = require(fullPath);

process.stdout.write(JSON.stringify(service.spec, null, 2));
