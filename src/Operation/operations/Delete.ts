import Operation from '../Operation';
import Component from '../../Component';

/** Returns class for a delete operation. */
const Delete = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentClass: any,
  componentAction: string = Operation.types.DELETE
): typeof Operation => {
  if (!ComponentClass) {
    throw new Error('Argument "ComponentClass" is undefined for "Delete" operation' +
      ' function');
  }

  ComponentClass = ComponentClass as unknown as typeof Component;

  const componentTitle = ComponentClass.getTitle();
  const componentTitleLower = componentTitle.toLowerCase();

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
      return {
        ...super.errors,
        DocumentNotFoundError: {
          statusCode: 404,
          description: `${componentTitle} is not found`
        }
      };
    }

    /** Returns query schema with a component ID. */
    static get query() {
      return {
        id: {
          description: `ID of ${componentTitleLower} to be deleted`,
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
