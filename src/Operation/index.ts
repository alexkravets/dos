import Operation, { type Input, type OperationClass } from './Operation';

import Read from './operations/Read';
import List from './operations/List';
import Index from './operations/Index';
import Create from './operations/Create';
import Update from './operations/Update';
import Delete from './operations/Delete';
import { withActivity, type CreateActivityProps } from './helpers';

export default Operation;

export {
  Read,
  List,
  Index,
  Create,
  Update,
  Delete,
  Operation,
  withActivity,
};

export * from './errors';
export * from './security';

export type {
  Input,
  OperationClass,
  CreateActivityProps
};
