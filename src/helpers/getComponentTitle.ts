import pluralize from 'pluralize';
import { startCase, capitalize } from 'lodash';

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
 * **Examples:**
 * ```typescript
 * // Basic usage - capitalized, singular (default)
 * getComponentTitle({ name: 'UserProfile' })
 * // Returns: "User profile"
 *
 * getComponentTitle({ name: 'orderItem' })
 * // Returns: "Order item"
 *
 * // Plural form for collections
 * getComponentTitle({ name: 'UserProfile' }, true, true)
 * // Returns: "User profiles"
 *
 * // Lowercase, plural for operation summaries
 * getComponentTitle({ name: 'UserProfile' }, false, true)
 * // Returns: "user profiles"
 *
 * // Lowercase, singular
 * getComponentTitle({ name: 'OrderItem' }, false, false)
 * // Returns: "order item"
 * ```
 *
 * @param Component - An object with a `name` property containing the component name
 * @param isCapitalized - Whether to capitalize the first letter (default: true)
 * @param isPlural - Whether to pluralize the title (default: false)
 * @returns A formatted, human-readable title string
 */
const getComponentTitle = (
  Component: { name: string; },
  isCapitalized: boolean = true,
  isPlural: boolean = false
): string => {
  const { name } = Component;

  let componentTitle = startCase(name).toLowerCase();

  if (isPlural) {
    componentTitle = pluralize(componentTitle);
  }

  if (isCapitalized) {
    componentTitle = capitalize(componentTitle);
  }

  return componentTitle;
};

export default getComponentTitle;
