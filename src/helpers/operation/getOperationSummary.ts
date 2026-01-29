import { startCase, capitalize } from 'lodash';

/** Returns operation summary for component name and action. */
const getOperationSummary = (componentAction: string, componentName?: string): string => {
  if (!componentName) {
    return '';
  }

  const componentTitle = startCase(componentName).toLowerCase();

  return capitalize(`${componentAction} ${componentTitle}`);
};

export default getOperationSummary;
