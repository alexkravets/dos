import Component from '../Component';
import { capitalize } from 'lodash';
import Operation, { type Result } from '../Operation';
import { type PropertiesSchemaSource } from '@kravc/schema';

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

const DEFAULT_LIMIT = 20;
const DEFAULT_LIMIT_MAX = 999;
const DEFAULT_SORT_ORDER = SORT_ORDER.DESC;

type PageInfo = {
  sort: 'asc' | 'desc';
  count: number;
  limit: number;
  lastEvaluatedKey: string;
  exclusiveStartKey: string;
}

/** Returns class for an index operation. */
const Index = (
  ComponentClass: typeof Component,
  componentAction: string = 'index'
): typeof Operation => {
  if (!ComponentClass) {
    throw new Error('Argument "ComponentClass" is undefined for "Index"' +
      ' operation function');
  }

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
      return DEFAULT_LIMIT;
    }

    /** Returns maximum number for a limit parameter. */
    static get limitMax() {
      return DEFAULT_LIMIT_MAX;
    }

    /** Returns default value for a sort parameter. */
    static get defaultSort() {
      return DEFAULT_SORT_ORDER;
    }

    /** Returns query schema for pagination parameters. */
    static get query() {
      return {
        limit: {
          min: 1,
          max: this.limitMax,
          type: 'integer',
          default: this.defaultLimit,
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
      } as PropertiesSchemaSource;
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
            exclusiveStartKey: {
              description: 'Exclusive start key specified for the request',
            },
            lastEvaluatedKey: {
              description: `Last evaluated key to get next batch of ${documentTitle}`,
            },
            limit: {
              type: 'integer',
              description: `Limit number of ${documentTitle} to be returned`,
            },
            count: {
              type: 'integer',
              description: `Number of of ${documentTitle}`,
            },
            sort: {
              enum: Object.values(SORT_ORDER),
              description: 'Sort direction',
            }
          }
        }
      };
    }

    /** Executes components index action. */
    async action(parameters: Record<string, unknown>) {
      const {
        sort,
        limit,
        index,
        exclusiveStartKey,
        ...query
      } = parameters;

      const options = {
        sort,
        limit,
        index,
        exclusiveStartKey,
      };

      const { componentActionMethod } = this.constructor as typeof Operation;

      const result = await componentActionMethod(this.context, query, options);

      const {
        count,
        objects,
        lastEvaluatedKey,
      } = result;

      return {
        data: objects,
        pageInfo: {
          sort,
          count,
          limit,
          lastEvaluatedKey,
          exclusiveStartKey
        },
      } as { data: Result, pageInfo: PageInfo };
    }
  };
};

export default Index;
