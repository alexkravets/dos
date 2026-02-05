import Component from '../../Component';
import Operation from '../Operation';
import { capitalize } from 'lodash';

/** Returns class for an list operation. */
const List = (
  ComponentClass: typeof Component,
  componentAction: string = 'indexAll'
): typeof Operation => {
  if (!ComponentClass) {
    throw new Error('Argument "ComponentClass" is undefined for "List"' +
      ' operation function');
  }

  const documentTitle = ComponentClass.getTitle(false, true);

  /** List operation class */
  return class extends Operation {
    /** Returns summary for an index operation. */
    static get summary() {
      return capitalize(`${componentAction} ${documentTitle}`);
    }

    /** Returns component class for an index operation. */
    static get Component() {
      return ComponentClass;
    }

    /** Returns component action name for an index operation. */
    static get componentAction() {
      return componentAction;
    }
  };
};

export default List;
