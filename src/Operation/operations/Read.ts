import Operation from '../Operation';
import Component from '../../Component';

/** Returns class for a read operation. */
const Read = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentClass: any,
  componentAction: string = Operation.types.READ
): typeof Operation => {
  if (!ComponentClass?.isComponent) {
    throw new Error('Argument "ComponentClass" is undefined for "Read" operation' +
      ' function');
  }

  ComponentClass = ComponentClass as unknown as typeof Component;

  const componentTitle = ComponentClass.getTitle();
  const componentTitleLower = componentTitle.toLowerCase();

  /** Read operation class */
  return class extends Operation {
    /** Returns component class for a read operation. */
    static get Component() {
      return ComponentClass;
    }

    /** Returns component action name for a read operation. */
    static get componentAction() {
      return componentAction;
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
          description: `ID of ${componentTitleLower} to be returned`,
          required: true
        }
      };
    }
  };
};

export default Read;
