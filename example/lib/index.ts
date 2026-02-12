import {
  Create as BaseCreate,
  Update as BaseUpdate,
  Delete as BaseDelete,
  Read,
  List,
  Index,
  withActivity,
} from '../../src';

import createActivity from './createActivity';

const Create = withActivity(BaseCreate, createActivity);
const Update = withActivity(BaseUpdate, createActivity);
const Delete = withActivity(BaseDelete, createActivity);

export {
  Read,
  List,
  Index,
  Create,
  Update,
  Delete,
};
