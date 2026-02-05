import Operation from '../Operation';
import Component from '../../Component';

/** Returns class for a create operation. */
const Create = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentClass: any,
  componentAction: string = Operation.types.CREATE
): typeof Operation => {
  if (!Component) {
    throw new Error('Argument "ComponentClass" is undefined for "Create" operation' +
      ' function');
  }

  ComponentClass = ComponentClass as unknown as typeof Component;

  const componentTitle = ComponentClass.getTitle();

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
