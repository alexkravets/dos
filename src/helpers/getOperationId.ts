import pluralize from 'pluralize';
import { startCase } from 'lodash';

/** Returns operation ID for a component and its action. */
const getOperationId = (name: string, componentName: string, componentAction: string) => {
  const isCustomOperationName =
    name !== 'Operation' &&
    name !== '';

  if (isCustomOperationName) {
    return name;
  }

  if (Component && componentAction) {
    const isIndex = componentAction === 'index';
    const actionName = startCase(componentAction);

    if (isIndex) {
      const componentTitlePlural = pluralize(startCase(Component.name));
      return `${actionName}${componentTitlePlural}`;
    }

    return `${actionName}${Component.name}`;
  }

  throw new Error('Operation ID is undefined');
};

export default getOperationId;
