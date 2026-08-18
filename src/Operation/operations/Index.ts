import Component from '../../Component';
import { get, capitalize } from 'lodash';
import Operation, { type Result, type OperationClass } from '../Operation';

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

const DEFAULT_LIMIT = 20;
const DEFAULT_LIMIT_MAX = 100;
const DEFAULT_SORT_ORDER = SORT_ORDER.DESC;

export type PageInfo = {
  sort: 'asc' | 'desc';
  count: number;
  limit: number;
  lastEvaluatedKey?: string;
}

/** Query an index operation contributes. */
type IndexQuery = {
  limit: { type: 'integer'; default: number };
  sort: { enum: readonly ('asc' | 'desc')[]; default: 'asc' | 'desc' };
  exclusiveStartKey: { description: string };
};

type IndexOperationClass = OperationClass<{ query: IndexQuery }>;

/** Returns class for an index operation. */
const Index = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentClass: any,
  componentAction: string = 'index'
): IndexOperationClass => {
  if (!ComponentClass?.isComponent) {
    throw new Error('Argument "ComponentClass" is undefined for "Index"' +
      ' operation function');
  }

  ComponentClass = ComponentClass as unknown as typeof Component;

  const documentTitle = ComponentClass.getTitle(false, true);

  /** Index operation class */
  return class extends Operation {
    /** Returns summary for an index operation. */
    static get summary() {
      return capitalize(`${componentAction} ${documentTitle}`);
    }

    /** Returns component class for an index operation. */
    static get Component() {
      return ComponentClass;
    }

    /** Returns component action name for an index operation. */
    static get componentAction() {
      return componentAction;
    }

    /** Returns default value for a limit parameter. */
    static get defaultLimit() {
      return get(ComponentClass, 'indexDefaultLimit', DEFAULT_LIMIT);
    }

    /** Returns maximum number for a limit parameter. */
    static get limitMax() {
      return get(ComponentClass, 'indexLimitMax', DEFAULT_LIMIT_MAX);
    }

    /** Returns default value for a sort parameter. */
    static get defaultSort() {
      return DEFAULT_SORT_ORDER;
    }

    /** Returns query schema for pagination parameters. */
    static get query() {
      return {
        limit: {
          type: 'integer',
          example: this.defaultLimit,
          default: this.defaultLimit,
          minimum: 1,
          maximum: this.limitMax,
          description: `Limit number of ${documentTitle} to be returned`,
        },
        sort: {
          enum: Object.values(SORT_ORDER),
          default: this.defaultSort,
          description: 'Sort direction',
        },
        exclusiveStartKey: {
          description: `Exclusive start key to return next batch of ${documentTitle}`,
        }
      } as IndexQuery;
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
        pageInfo: {
          required: true,
          properties: {
            sort: {
              enum: Object.values(SORT_ORDER),
              description: 'Sort direction',
            },
            count: {
              type: 'integer',
              example: 5,
              description: `Number of ${documentTitle}`,
            },
            limit: {
              type: 'integer',
              example: get(ComponentClass, 'indexDefaultLimit', DEFAULT_LIMIT),
              description: `Limit number of ${documentTitle} to be returned`,
            },
            lastEvaluatedKey: {
              description: `Last evaluated key to get next batch of ${documentTitle}`,
            },
          }
        }
      };
    }

    /** Executes components index action. */
    async action(parameters: Record<string, unknown>) {
      const {
        sort,
        limit,
        indexName,
        exclusiveStartKey,
        ...query
      } = parameters;

      const options = {
        sort,
        limit,
        indexName,
        exclusiveStartKey,
      };

      const { componentActionMethod } = this.constructor as typeof Operation;

      const result = await componentActionMethod(this.context, query, options);

      const {
        objects: data,
        count,
        lastEvaluatedKey,
      } = result;

      const pageInfo = {
        sort,
        count,
        limit,
        lastEvaluatedKey,
      } as PageInfo;

      return { data, pageInfo } as { data: Result, pageInfo: PageInfo };
    }
  };
};

export default Index;
