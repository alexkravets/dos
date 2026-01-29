import pluralize from 'pluralize';
import { startCase } from 'lodash';

/** Returns operation ID for a component and its action. */
const getOperationId = (name: string, componentAction: string, componentName?: string) => {
  const isCustomOperationName =
    name !== 'Operation' &&
    name !== '';

  if (isCustomOperationName) {
    return name;
  }

  if (!componentName) {
    throw new Error('Operation ID is undefined');
  }

  const isIndex = componentAction === 'index';
  const actionName = startCase(componentAction);

  if (isIndex) {
    const componentTitlePlural = pluralize(startCase(componentName));
    return `${actionName}${componentTitlePlural}`;
  }

  return `${actionName}${componentName}`;
};

export default getOperationId;
