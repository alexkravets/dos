import { get } from 'lodash';
import { Context } from './Context';
import { withSafeAttributes } from './helpers/component';
import { Schema, Validator, got } from '@kravc/schema';

type Attributes = Record<string, unknown>;

/** Component */
class Component {
  private static _schema?: Schema;

  private _id?: string;
  private _context: Context;
  private _validator: Validator;
  private _attributes: Attributes;

  /** Creates an instance of the component in the context with specified attributes. */
  constructor(context: Context, attributes: Attributes) {
    this._id = get(attributes, 'id') as string;
    this._context = context;
    this._validator = got(context, 'validator', `Validator is undefined for "${this.componentId}:${this.id}"`) as Validator;
    this._attributes = attributes;

    return withSafeAttributes<Component>(this);
  }

  /** Flags if a component class. */
  static get isComponent(): boolean {
    return true;
  }

  /** Returns component ID. */
  static get id(): string {
    return this.name;
  }

  /** Attaches schema to validate component attributes. */
  static set schema(schema: Schema) {
    this._schema = schema;
  }

  /** Returns schema to validate component attributes. */
  static get schema(): Schema | undefined {
    return this._schema;
  }

  /** Returns schema for component mutation attributes. */
  static get mutationSchema(): Schema | undefined {
    return this.schema;
  }

  /** Returns component instance ID. */
  get id(): string | null {
    return this._id || null;
  }

  /** Returns context of the component instance. */
  get context() {
    return this._context;
  }

  /** Returns component attributes. */
  get attributes() {
    return this._attributes;
  }

  /** Returns name of a component class. */
  get componentId(): string {
    return get(this.constructor, 'id')!;
  }

  /** Returns JSON stringified component attributes. */
  get json() {
    return JSON.parse(JSON.stringify(this));
  }

  /** Returns component attributes, ready for JSON stringify. */
  toJSON() {
    return this.attributes;
  }

  /** Validates component JSON stringified attributes. */
  validate() {
    return this._validator.validate(this.json, this.componentId);
  }
}

export type ComponentConstructor = new (context: Context, attributes: Attributes) => Component;

export default Component;
