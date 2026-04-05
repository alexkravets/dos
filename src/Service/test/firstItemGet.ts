/// <reference types="jest" />
import { get } from 'lodash';
import { got } from '@kravc/schema';
import { type Items } from './findItem';

/** Returns value or ensures specified attribute exists for the first item from the list. */
const firstItemGet = (items: Items, attributeName: string, isUndefinedExpected: boolean = false) => {
  const [ firstItem ] = items;

  if (isUndefinedExpected) {
    return get(firstItem || {}, attributeName);
  }

  expect(firstItem).toBeDefined();

  return got(firstItem, attributeName);
};

export default firstItemGet;
