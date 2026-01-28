import { startCase, capitalize } from 'lodash';

/** Returns operation summary for component name and action. */
const getOperationSummary = (componentName: string, componentAction: string): string => {
  const componentTitle = startCase(componentName).toLowerCase();

  return capitalize(`${componentAction} ${componentTitle}`);
};

export default getOperationSummary;
