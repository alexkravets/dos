import Operation, { type OperationClass, type OperationComponent } from '../Operation';
import Component from '../../Component';

/** Query an update operation contributes. */
type UpdateQuery = {
  id: { description: string; required: true };
};

/**
 * The mutation an update operation takes from its component, which drops what
 * an update does not require, the way the operation does at runtime.
 */
type UpdateMutation<ComponentType extends OperationComponent> =
  ComponentType['mutationSchema'] extends { pure(id?: string): infer Pured }
    ? Pured
    : null;

type UpdateOperationClass<ComponentType extends OperationComponent> = OperationClass<{
  query: UpdateQuery;
  mutation: UpdateMutation<ComponentType>;
}>;

/** Returns class for an update operation. */
const Update = <ComponentType extends OperationComponent>(
  component: ComponentType,
  componentAction: string = Operation.types.UPDATE
): UpdateOperationClass<ComponentType> => {
  const ComponentClass = component as unknown as typeof Component;

  if (!ComponentClass?.isComponent) {
    throw new Error('Argument "ComponentClass" is undefined for "Update" operation' +
      ' function');
  }

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
      } as const;
    }
  } as unknown as UpdateOperationClass<ComponentType>;
};

export default Update;
