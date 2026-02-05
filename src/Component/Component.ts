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

  /** Creates an instance of the component in the context with specified attributes. */
  constructor(context: Context, attributes: Attributes) {
    const idKey = get(this.constructor, 'idKey')!;

    this._id = get(attributes, idKey, null) as string;
    this._context = context;
    this._attributes = attributes;

    return withSafeAttributes<Component<Attributes>>(this);
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

  /**
   * Converts a component name into a human-readable title for use in API documentation,
   * error messages, operation summaries, and other user-facing text.
   *
   * **Intent:**
   * This function transforms camelCase or PascalCase component names (e.g., "UserProfile",
   * "orderItem") into properly formatted, readable titles that can be used throughout the
   * API specification and error messages. It handles pluralization and capitalization
   * according to the context where the title will be displayed.
   *
   * **Use Cases:**
   * - Generating error messages: "User profile is not found" or "Order item could not be created"
   * - Creating operation summaries: "Index user profiles" or "Create order item"
   * - Building query parameter descriptions: "User profile ID" or "Order item ID"
   * - Generating OpenAPI tags and documentation strings
   * - Creating consistent, human-readable labels from component class names
   *
   * @param Component - An object with a `name` property containing the component name
   * @param isCapitalized - Whether to capitalize the first letter (default: true)
   * @param isPlural - Whether to pluralize the title (default: false)
   * @returns A formatted, human-readable title string
   */
  static getTitle = (isCapitalized: boolean = true, isPlural: boolean = false): string => {
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
    return this._context.validator.validate(this.json, this.componentId);
  }
}

export default Component;
