import Create from '../operations/Create';
import Update from '../operations/Update';
import Delete from '../operations/Delete';
import Context from '../../Context';
import Operation, { type Result } from '../Operation';

type BaseAction = typeof Create | typeof Update | typeof Delete;

export type CreateActivityProps = {
  result?: Result;
  context: Context;
  parameters: Record<string, unknown>;
  componentName?: string;
}

/** Extends operation with a custom create activity method. */
const withActivity = <Action extends BaseAction>(
  baseAction: Action,
  createActivity: (props: CreateActivityProps) => Promise<void>
) => {
  return (ComponentClass: unknown, componentAction?: string): ReturnType<Action> => {
    const baseFactory = baseAction as (
      component: unknown,
      action?: string
    ) => typeof Operation;

    const BaseOperation = baseFactory(ComponentClass, componentAction);

    /** Operation class with create activity method. */
    return class extends BaseOperation {
      /** Creates activity after default exec is done */
      async createActivity(
        parameters: Record<string, unknown>,
        result?: Result
      ): Promise<void> {
        const context = this.context;
        const { componentName } = this.constructor as typeof Operation;

        await createActivity({
          result,
          context,
          parameters,
          componentName,
        });
      }
    } as unknown as ReturnType<Action>;
  };
};

export default withActivity;
