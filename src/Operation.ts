import Component from './Component';
import { type Context } from './Context';
import { OriginalError } from './helpers/error';
import { withSafeAttributes } from './helpers/component';
import { get, isEmpty, cloneDeep } from 'lodash';
import { Schema, type PropertiesSchemaSource } from '@kravc/schema';
import { type SecurityRequirements, type ErrorResponse } from './helpers/service';
import { getOperationId, getOperationTags, getOperationSummary } from './helpers/operation';

type QueryMap = Record<string, unknown>;
type MutationMap = Record<string, unknown>;
export type Result = Record<string, unknown>;

type ComponentActionMethod = (
  context: Context,
  query: QueryMap,
  mutation: MutationMap
) => Promise<Result>;

export type OperationResponse = {
  result: Record<string, unknown>;
  headers: Record<string, unknown>;
  multiValueHeaders: Record<string, unknown>;
}

/** Operation */
class Operation {
  private _context: Context;
  private _headers: Record<string, unknown>;
  private _multiValueHeaders: Record<string, unknown>;

  /** Creates an instance of operation. */
  constructor(context: Context) {
    this._context = context;
    this._headers = {};
    this._multiValueHeaders = {};

    return withSafeAttributes(this);
  }

  /** Flags if a component class. */
  static get isComponent(): boolean {
    return false;
  }

  /** Returns supported operation types. */
  static get types() {
    return {
      READ: 'read',
      CREATE: 'create',
      UPDATE: 'update',
      DELETE: 'delete'
    };
  }

  /** Returns default operation type. */
  static get type() {
    return Operation.types.READ;
  }

  /** Flags if operation is of a create type. */
  static get isCreate() {
    return this.type === Operation.types.CREATE;
  }

  /** Flags if operation is of an update type. */
  static get isUpdate() {
    return this.type === Operation.types.UPDATE;
  }

  /** Returns component class the operations is defined for. */
  static get Component(): null | typeof Component {
    return null;
  }

  /** Returns related component name. */
  static get componentName() {
    return this.Component?.name;
  }

  /** Returns component action name for the operation to execute. */
  static get componentAction() {
    return this.type;
  }

  /** Returns component schema. */
  static get componentSchema() {
    return this.Component?.schema;
  }

  /** Returns component mutation schema. */
  static get componentMutationSchema() {
    return this.Component?.mutationSchema;
  }

  /** Returns operation ID. */
  static get id() {
    return getOperationId(this.name, this.componentAction, this.componentName);
  }

  /** Returns operation tags. */
  static get tags() {
    return getOperationTags(this.componentName);
  }

  /** Returns operation summary. */
  static get summary() {
    return getOperationSummary(this.componentAction, this.componentName);
  }

  /** Returns operation description. */
  static get description() {
    return '';
  }

  /** Returns operation security requirements. */
  static get security(): SecurityRequirements {
    return [];
  }

  /** Returns possible operation errors. */
  static get errors() {
    let errors = {} as Record<string, ErrorResponse>;

    for (const orRequirement of this.security) {
      const andRequirements = Object.values(orRequirement);

      for (const andRequirement of andRequirements) {
        errors = {
          ...andRequirement.errors,
          ...errors
        };
      }
    }

    if (this.inputSchema) {
      errors.InvalidInputError = {
        statusCode: 400,
        description: 'Invalid operation input, make sure operation parameters' +
          ' do match specification'
      };

      errors.InvalidParametersError = {
        statusCode: 400,
        description: 'Invalid operation parameters, input syntax is correct,' +
          ' but input values are not processible'
      };
    }

    if (this.outputSchema) {
      errors.InvalidOutputError = {
        statusCode: 500,
        description: 'Invalid output returned by the operation, this issue' +
          ' to be addressed by service developer'
      };
    }

    errors.UnprocessibleConditionError = {
      statusCode: 422,
      description: 'Operation failed to process the request cause of expected' +
        ' exit condition'
    };

    return errors;
  }

  /** Returns status code for an error. */
  static getErrorStatusCode(error: OriginalError): number {
    const { code } = error;
    return get(this.errors, `${code}.statusCode`, 500) as number;
  }

  /** Returns operation query schema source. */
  static get query(): null | PropertiesSchemaSource {
    return null;
  }

  /** Returns operation mutation schema instance or schema source. */
  static get mutation(): null | Schema | PropertiesSchemaSource {
    if (this.componentMutationSchema) {
      if (this.isUpdate) {
        return this.componentMutationSchema.pure();
      }

      if (this.isCreate) {
        return this.componentMutationSchema.clone();
      }
    }

    return null;
  }

  /** Returns operation mutation schema. */
  static get mutationSchema(): null | Schema {
    if (!this.mutation) {
      return null;
    }

    return new Schema(this.mutation, `${this.id}InputMutation`);
  }

  /** Returns operation input validation schema. */
  static get inputSchema(): null | Schema {
    const source = {
      ...this.query,
    } as Record<string, unknown>;

    if (this.mutationSchema) {
      source.mutation = {
        $ref: `${this.id}InputMutation`,
        required: true
      };
    }

    if (isEmpty(source)) {
      return null;
    }

    return new Schema(source as PropertiesSchemaSource, `${this.id}Input`);
  }

  /** Returns operation output schema source. */
  static get output(): null | PropertiesSchemaSource {
    if (!this.componentSchema) {
      return null;
    }

    return {
      data: {
        $ref: this.componentSchema.id,
        required: true
      }
    };
  }

  /** Returns operation output validation schema. */
  static get outputSchema(): null | Schema {
    if (!this.output) {
      return null;
    }

    return new Schema(this.output, `${this.id}Output`);
  }

  /** Flags if operation has output. */
  static get hasOutput(): boolean {
    return !!this.outputSchema;
  }

  /** Returns component action method binded to component. */
  static get componentActionMethod() {
    const { Component, componentAction } = this;

    if (Component) {
      const componentActionMethod = get(Component, componentAction) as ComponentActionMethod;

      if (!componentActionMethod) {
        throw new Error(`Operation "${this.id}" expects component action` +
          ` method "${Component.name}.${componentAction}(context, ...)" to be` +
          ' defined');
      }

      return componentActionMethod.bind(Component);
    }

    throw new Error(`Operation "${this.id}" expects component to be defined`);
  }

  /** Adds header value to context headers. */
  setHeader(name: string, value: unknown, isMultiValue = false) {
    if (isMultiValue) {
      this._multiValueHeaders[name.toLowerCase()] = value;

      return;
    }

    this._headers[name.toLowerCase()] = value;
  }

  /** Returns operation context. */
  get context() {
    return this._context;
  }

  /** Pre-processes operation parameters before action. */
  async before(parameters: Record<string, unknown>) {
    return parameters;
  }

  /** Executes component action. */
  async action(parameters: Record<string, unknown>) {
    const { Component } = this.constructor as typeof Operation;

    if (!Component) {
      return {};
    }

    const { mutation = {}, ...query } = parameters;
    const { componentActionMethod } = this.constructor as typeof Operation;

    const data = await componentActionMethod(this.context, query, mutation as MutationMap);

    return { data } as { data?: Result };
  }

  /** Post-processes operation result after action. */
  async after(_parameters: Record<string, unknown>, result?: Record<string, unknown>) {
    return result;
  }

  /** Executes operation for the request input. */
  async exec(input: Record<string, unknown>): Promise<OperationResponse> {
    let parameters = cloneDeep(input);
    let result;

    const beforeResult = await this.before(parameters);

    parameters = beforeResult
      ? beforeResult
      : parameters;

    result = await this.action(parameters);

    const afterResult = await this.after(parameters, result.data || result);

    result = afterResult
      ? ( result.data ? { ...result, data: afterResult } : afterResult )
      : result;

    return {
      result,
      headers: this._headers,
      multiValueHeaders: this._multiValueHeaders
    };
  }
}

export default Operation;
