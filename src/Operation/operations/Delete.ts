import Operation, { type OperationClass, type OperationComponent } from '../Operation';
import Component from '../../Component';

/** Query a delete operation contributes. */
type DeleteQuery = {
  id: { description: string; required: true };
};

type DeleteOperationClass = OperationClass<{ query: DeleteQuery }>;

/** Returns class for a delete operation. */
const Delete = (
  component: OperationComponent,
  componentAction: string = Operation.types.DELETE
): DeleteOperationClass => {
  const ComponentClass = component as unknown as typeof Component;

  if (!ComponentClass?.isComponent) {
    throw new Error('Argument "ComponentClass" is undefined for "Delete" operation' +
      ' function');
  }

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
      } as const;
    }

    /** No output for a delete operation. */
    static get output() {
      return null;
    }
  };
};

export default Delete;
