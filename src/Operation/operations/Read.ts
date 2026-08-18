import Operation, { type OperationClass, type OperationComponent } from '../Operation';
import Component from '../../Component';

/** Query a read operation contributes. */
type ReadQuery = {
  id: { description: string; required: true };
};

type ReadOperationClass = OperationClass<{ query: ReadQuery }>;

/** Returns class for a read operation. */
const Read = (
  component: OperationComponent,
  componentAction: string = Operation.types.READ
): ReadOperationClass => {
  const ComponentClass = component as unknown as typeof Component;

  if (!ComponentClass?.isComponent) {
    throw new Error('Argument "ComponentClass" is undefined for "Read" operation' +
      ' function');
  }

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
      } as const;
    }
  };
};

export default Read;
