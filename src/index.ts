import { got as getOrFail } from '@kravc/schema';

import Read from './operations/Read';
import List from './operations/List';
import Index from './operations/Index';
import Create from './operations/Create';
import Update from './operations/Update';
import Delete from './operations/Delete';

import Component from './Component';
import Operation from './Operation';

import { maskSecrets } from './helpers/error';
import { getComponentTitle } from './helpers/component';

export {
  Read,
  List,
  Index,
  Create,
  Update,
  Delete,
  Operation,
  Component,

  // Document:                    require('./Document'),
  // Service:                     require('./Service'),

  // authorize:                   require('./helpers/authorize'),
  // getDefaultSchemaAttributes:  require('./helpers/getDefaultSchemaAttributes'),

  // wait,
  // execute,
  // createAccessToken,

  getOrFail,
  maskSecrets,
  getComponentTitle,
};

export * from './errors';
export * from './security';
