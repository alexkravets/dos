import Operation from '../Operation';
import Component from '../../Component';

/** Returns class for an update operation. */
const Update = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentClass: any,
  componentAction: string = Operation.types.UPDATE
): typeof Operation => {
  if (!ComponentClass?.isComponent) {
    throw new Error('Argument "ComponentClass" is undefined for "Update" operation' +
      ' function');
  }

  ComponentClass = ComponentClass as unknown as typeof Component;

  const componentTitle = ComponentClass.getTitle();
  const componentTitleLower = componentTitle.toLowerCase();

  /** Update operation class */
  return class extends Operation {
    /** Returns component class for an update operation. */
    static get Component() {
      return ComponentClass;
    }

    /** Returns component action name for an update operation. */
    static get componentAction() {
      return componentAction;
    }

    /** Returns update operation type. */
    static get type() {
      return Operation.types.UPDATE;
    }

    /** Returns possible errors for a read operation. */
    static get errors() {
      return {
        ...super.errors,
        DocumentNotFoundError: {
          statusCode:  404,
          description: `${componentTitle} is not found`
        }
      };
    }

    /** Returns query schema with a component ID. */
    static get query() {
      return {
        id: {
          description: `ID of ${componentTitleLower} to be updated`,
          required: true
        }
      };
    }
  };
};

export default Update;
