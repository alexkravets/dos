import Operation, { type OperationClass, type OperationComponent } from '../Operation';
import Component from '../../Component';

/**
 * The mutation a create operation takes from its component.
 *
 * Reading the schema off the component is what lets a mutation describe a type:
 * a component declaring the type of its schema passes it on to the operation.
 */
type CreateOperationClass<ComponentType extends OperationComponent> = OperationClass<{
  mutation: ComponentType['mutationSchema'];
}>;

/** Returns class for a create operation. */
const Create = <ComponentType extends OperationComponent>(
  component: ComponentType,
  componentAction: string = Operation.types.CREATE
): CreateOperationClass<ComponentType> => {
  const ComponentClass = component as unknown as typeof Component;

  if (!ComponentClass?.isComponent) {
    throw new Error('Argument "ComponentClass" is undefined for "Create" operation' +
      ' function');
  }

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
  } as unknown as CreateOperationClass<ComponentType>;
};

export default Create;
