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
 */
function withSafeAttributes<T>(targetInstance: T, className: string): T {
  return new Proxy(targetInstance as object, {
    /** Ensures attribute is defined as property or method of the instance. */
    get(target: Record<string, unknown>, prop: string) {
      const shouldSkip = ['then'].includes(prop);

      if (shouldSkip) {
        return undefined;
      }

      const errorTemplate = `"$PATH" property or method is undefined for ${className} instance`;
      return got(target, prop, errorTemplate);
    }
  }) as T;
};

export default withSafeAttributes;
