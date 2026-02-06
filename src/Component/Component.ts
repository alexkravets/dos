import { get } from 'lodash';
import pluralize from 'pluralize';
import { Schema } from '@kravc/schema';
import { startCase, capitalize } from 'lodash';
import Context, { withSafeAttributes } from '../Context';

const DEFAULT_ID_KEY = 'id';

/** Component */
class Component<Attributes> {
  protected static _schema?: Schema;

  private _id: string | null;
  private _context: Context;
  private _attributes: Attributes;

  /** Creates an instance of the component with execution context and attributes. */
  constructor(context: Context, attributes: Attributes) {
    const idKey = get(this.constructor, 'idKey')!;
    const className = get(this.constructor, 'name')!;

    this._id = get(attributes, idKey, null) as string;
    this._context = context;
    this._attributes = attributes;

    return withSafeAttributes<Component<Attributes>>(this, className);
  }

  /** Returns ID key of a component. */
  static get idKey(): string {
    return DEFAULT_ID_KEY;
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
    this._schema = schema.clone(this.id);
  }

  /** Returns schema to validate component attributes. */
  static get schema(): Schema | undefined {
    return this._schema;
  }

  /** Returns schema for component mutation attributes. */
  static get mutationSchema(): Schema | undefined {
    return this.schema;
  }

  /** Converts a component name into a human-readable title. */
  static getTitle(isCapitalized: boolean = true, isPlural: boolean = false): string {
    const { name } = this;

    let componentTitle = startCase(name).toLowerCase();

    if (isPlural) {
      componentTitle = pluralize(componentTitle);
    }

    if (isCapitalized) {
      componentTitle = capitalize(componentTitle);
    }

    return componentTitle;
  };

  /** Returns component instance ID. */
  get id() {
    return this._id;
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

  /** Returns normalized component attributes. */
  get json() {
    return JSON.parse(JSON.stringify(this));
  }

  /** Returns component attributes, ready for JSON stringify. */
  toJSON() {
    return this.attributes;
  }

  /** Validates component JSON stringified attributes. */
  validate(): void {
    return this._context.validator.validate(this.json, this.componentId);
  }
}

export default Component;
