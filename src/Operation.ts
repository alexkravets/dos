import Component from './Component';
import { Schema } from '@kravc/schema';
import getOperationId from './helpers/getOperationId';
import { type Context } from './Context';
import getOperationTags from './helpers/getOperationTags';
import withSafeAttributes from './helpers/withSafeAttributes';
import getOperationSummary from './helpers/getOperationSummary';
import { isEmpty, cloneDeep } from 'lodash';


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

  /** Returns component class the operations is defined for. */
  static get Component(): typeof Component {
    throw new Error('Operation.Component must be overridden by a subclass');
  }

  /** Returns related component name. */
  static get componentName() {
    return this.Component!.name;
  }

  /** Returns component action name for the operation to execute. */
  static get componentAction() {
    return this.type;
  }

  /** Returns operation ID. */
  static get id() {
    return getOperationId(this.name, this.componentName, this.componentAction);
  }

  /** Returns operation tags. */
  static get tags() {
    return getOperationTags(this.componentName);
  }

  /** Returns operation summary. */
  static get summary() {
    return getOperationSummary(this.componentName, this.componentAction);
  }

  /** Returns operation description. */
  static get description() {
    return '';
  }

  /** Returns operation security requirements. */
  static get security() {
    return [];
  }

  /** Returns possible operation errors. */
  static get errors() {
    let errors = {};

    for (const orRequirement of this.security) {
      const andRequirements = Object.values(orRequirement);

      for (const andRequirement of andRequirements) {
        errors = { ...andRequirement.klass.errors, ...errors };
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

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get query() {
    return {};
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get mutation() {
    const { type, Component } = this;

    if (Component) {
      const { bodySchema, schema } = Component;
      const mutationSchema = bodySchema || schema;

      if (type === Operation.types.UPDATE) {
        return mutationSchema.pure();
      }

      if (type === Operation.types.CREATE) {
        return mutationSchema.clone();
      }
    }

    return null;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get mutationSchema() {
    const { id, mutation: schemaOrSource } = this;

    if (!schemaOrSource) { return null; }

    return new Schema(schemaOrSource, `${id}InputMutation`);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get inputSchema() {
    const { id } = this;
    let source = { ...this.query };

    if (this.mutationSchema) {
      source = {
        ...source,
        mutation: {
          $ref:     `${id}InputMutation`,
          required: true
        }
      };
    }

    if (isEmpty(source)) { return null; }

    return new Schema(source, `${id}Input`);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get output() {
    if (!this.Component) { return null; }

    return {
      data: {
        $ref:     this.Component.schema.id,
        required: true
      }
    };
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get outputSchema() {
    const { id, output: schemaOrSource } = this;

    if (!schemaOrSource) { return null; }

    return new Schema(schemaOrSource, `${id}Output`);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  static get componentActionMethod() {
    const { Component, componentAction } = this;

    if (!Component) {
      throw new Error(`Operation "${this.id}" expects component to be defined`);
    }

    const componentActionMethod = Component[componentAction];

    if (!componentActionMethod) {
      throw new Error(`Operation "${this.id}" expects component action` +
        ` method "${Component.name}.${componentAction}(context, ...)" to be` +
        ' defined');
    }

    return componentActionMethod.bind(Component);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  setHeader(name, value, isMultiValue = false) {
    if (isMultiValue) {
      this._multiValueHeaders[name.toLowerCase()] = value;

      return;
    }

    this._headers[name.toLowerCase()] = value;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  get context() {
    return this._context;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  before() {
    return;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  async action(parameters) {
    const { Component } = this.constructor;

    if (!Component) {
      return {};
    }

    const { componentActionMethod } = this.constructor;

    const { mutation, ...query } = parameters;

    const data = await (mutation
      ? componentActionMethod(this.context, query, mutation)
      : componentActionMethod(this.context, query)
    );

    return { data };
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  after() {
    return;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  async exec(_parameters) {
    let parameters = cloneDeep(_parameters);
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

module.exports = Operation;
