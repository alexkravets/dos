import { get } from 'lodash';
import { got } from '@kravc/schema';

/**
 * Returns instance of an object with safe attributes.
 *
 * ## Intent
 *
 * Wraps an object instance in a Proxy that enforces safe attribute access. This function ensures that:
 * - Properties and methods must exist on the instance before they can be accessed
 * - Clear, descriptive errors are thrown when accessing undefined properties/methods
 * - The object cannot be accidentally treated as a Promise (by returning `undefined` for `then`)
 *
 * This is particularly useful for component classes where you want to catch typos and undefined
 * property access early with helpful error messages that include the class name.
 *
 * ## Use Cases
 *
 * 1. **Component Safety**: Wrap component instances to ensure all property/method accesses are valid
 * 2. **Early Error Detection**: Catch typos and undefined accesses at runtime with clear error messages
 * 3. **Promise Prevention**: Prevent objects from being accidentally treated as Promises in async contexts
 * 4. **Type Safety**: Provide runtime validation complementing TypeScript's compile-time checks
 *
 * ## Examples
 *
 * ### Basic Usage
 *
 * ```typescript
 * class MyComponent {
 *   name: string;
 *   age: number;
 *
 *   constructor(name: string, age: number) {
 *     this.name = name;
 *     this.age = age;
 *     return withSafeAttributes<MyComponent>(this);
 *   }
 * }
 *
 * const component = new MyComponent('John', 30);
 * console.log(component.name);  // ✅ 'John'
 * console.log(component.age);   // ✅ 30
 * console.log(component.email); // ❌ Error: "email" property or method is undefined for MyComponent
 * ```
 *
 * ### Preventing Promise Confusion
 *
 * ```typescript
 * const component = new MyComponent('John', 30);
 *
 * // Without withSafeAttributes, this might accidentally treat the object as a Promise
 * // With withSafeAttributes, 'then' returns undefined, preventing this confusion
 * if (component.then) {
 *   // This will be false, preventing accidental Promise-like behavior
 * }
 * ```
 *
 * ### Error Messages Include Class Name
 *
 * ```typescript
 * class Profile {
 *   id: string;
 *
 *   constructor(id: string) {
 *     this.id = id;
 *     return withSafeAttributes<Profile>(this);
 *   }
 * }
 *
 * const profile = new Profile('123');
 * profile.nonExistentProperty;
 * // Error: "nonExistentProperty" property or method is undefined for Profile
 * ```
 *
 * ### Real-World Component Pattern
 *
 * ```typescript
 * import { Context } from './Context';
 * import withSafeAttributes from './helpers/withSafeAttributes';
 *
 * class Document {
 *   private _id: string;
 *   private _context: Context;
 *
 *   constructor(context: Context, id: string) {
 *     this._id = id;
 *     this._context = context;
 *     return withSafeAttributes<Document>(this);
 *   }
 *
 *   get id(): string {
 *     return this._id;
 *   }
 *
 *   get context(): Context {
 *     return this._context;
 *   }
 * }
 *
 * const doc = new Document(context, 'doc_123');
 * doc.id;        // ✅ 'doc_123'
 * doc.context;   // ✅ Context instance
 * doc.invalid;   // ❌ Error: "invalid" property or method is undefined for Document
 * ```
 */
function withSafeAttributes<T>(targetInstance: T): T {
  return new Proxy(targetInstance as object, {
    /** Ensures attribute is defined as property or method of the instance. */
    get(target: Record<string, unknown>, prop: string) {
      const isThenProp = prop === 'then';

      if (isThenProp) {
        return undefined;
      }

      const className = get(targetInstance, 'name', 'NoNameClass');
      const errorTemplate = `"$PATH" property or method is undefined for ${className}`;

      return got(target, prop, errorTemplate);
    }
  }) as T;
};

export default withSafeAttributes;
