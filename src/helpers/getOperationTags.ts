import pluralize from 'pluralize';
import { startCase } from 'lodash';

/** Returns operation tags for a component name. */
const getOperationTags = (componentName: string): string[] => {
  const componentTitlePlural = pluralize(startCase(componentName));

  return [ componentTitlePlural ];
};

export default getOperationTags;
