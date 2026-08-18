import Component from '../../Component';
import { capitalize } from 'lodash';
import Operation, { type Result, type OperationClass } from '../Operation';

/** Returns class for an list operation. */
const List = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentClass: any,
  componentAction: string = 'indexAll'
): OperationClass => {
  if (!ComponentClass?.isComponent) {
    throw new Error('Argument "ComponentClass" is undefined for "List"' +
      ' operation function');
  }

  ComponentClass = ComponentClass as unknown as typeof Component;

  const documentTitle = ComponentClass.getTitle(false, true);

  /** List operation class */
  return class extends Operation {
    /** Returns summary for an index operation. */
    static get summary() {
      const action = componentAction.replace('indexAll', 'list');
      return capitalize(`${action} ${documentTitle}`);
    }

    /** Returns component class for an index operation. */
    static get Component() {
      return ComponentClass;
    }

    /** Returns component action name for an index operation. */
    static get componentAction() {
      return componentAction;
    }

    /** Returns schema source for the operation output with pagination. */
    static get output() {
      return {
        data: {
          items: {
            $ref: ComponentClass.schema!.id
          },
          required: true,
        },
      };
    }

    /** Executes components list action. */
    async action(parameters: Record<string, unknown>) {
      const {
        sort,
        indexName,
        ...query
      } = parameters;

      const options = {
        sort,
        indexName,
      };

      const { componentActionMethod } = this.constructor as typeof Operation;

      const result = await componentActionMethod(this.context, query, options);

      const { objects } = result;

      return { data: objects } as { data: Result };
    }
  };
};

export default List;
