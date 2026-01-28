import pluralize from 'pluralize';
import { startCase } from 'lodash';

/** Returns default operation tags for a component. */
const defaultTags = (Component: { name: string; } | undefined): string[] => {
  if (!Component) {
    return [];
  }

  const { name } = Component;

  const componentTitlePlural = pluralize(startCase(name));

  return [ componentTitlePlural ];
};

export default defaultTags;
