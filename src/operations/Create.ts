import Operation from '../Operation';
import Component from '../Component';
import { getComponentTitle } from '../helpers/component';

/** Returns class for a create operation. */
const Create = (
  ComponentClass: typeof Component,
  componentAction: string = Operation.types.CREATE
): typeof Operation => {
  if (!ComponentClass) {
    throw new Error('Argument "ComponentClass" is undefined for "Create" operation' +
      ' function');
  }

  const componentTitle = getComponentTitle(ComponentClass);

  /** Create operation class */
  return class extends Operation {
    /** Returns component class for a create operation. */
    static get Component() {
      return ComponentClass;
    }

    /** Returns component action name for a create operation. */
    static get componentAction() {
      return componentAction;
    }

    /** Returns create operation type. */
    static get type() {
      return Operation.types.CREATE;
    }

    /** Returns possible errors for a create operation. */
    static get errors() {
      return {
        ...super.errors,
        DocumentExistsError: {
          statusCode: 422,
          description: `${componentTitle} could not be created, it already exists`
        }
      };
    }
  };
};

export default Create;
