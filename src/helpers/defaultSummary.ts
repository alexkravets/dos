import { startCase, capitalize } from 'lodash';

/** Returns operation summary for components action. */
const defaultSummary = (Component: { name: string; } | undefined, componentAction: string): string => {
  if (!Component) {
    return '';
  }

  const { name } = Component;

  const componentTitle = startCase(name).toLowerCase();

  return capitalize(`${componentAction} ${componentTitle}`);
};

export default defaultSummary;
