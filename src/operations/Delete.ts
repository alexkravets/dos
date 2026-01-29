import Operation from '../Operation';
import Component from '../Component';
import getComponentTitle from '../helpers/getComponentTitle';

/** Returns class for a delete operation. */
const Delete = (
  ComponentClass: typeof Component,
  componentAction: string = Operation.types.DELETE
): typeof Operation => {
  if (!ComponentClass) {
    throw new Error('Argument "ComponentClass" is undefined for "Delete" operation' +
      ' function');
  }

  /** Delete operation class */
  return class extends Operation {
    /** Returns component class for a delete operation. */
    static get Component() {
      return ComponentClass;
    }

    /** Returns component action name for a delete operation. */
    static get componentAction() {
      return componentAction;
    }

    /** Returns delete operation type. */
    static get type() {
      return Operation.types.DELETE;
    }

    /** Returns possible errors for a delete operation. */
    static get errors() {
      const documentTitle = getComponentTitle(ComponentClass);

      return {
        ...super.errors,
        DocumentNotFoundError: {
          statusCode: 404,
          description: `${documentTitle} is not found`
        }
      };
    }

    /** Returns query schema with a component ID. */
    static get query() {
      const documentTitle = getComponentTitle(ComponentClass);

      return {
        id: {
          description: `${documentTitle} ID`,
          required: true
        }
      };
    }

    /** No output for a delete operation. */
    static get output() {
      return null;
    }
  };
};

export default Delete;
