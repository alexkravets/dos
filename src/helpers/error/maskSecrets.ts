import { isObject, cloneDeep } from 'lodash';

const { isArray } = Array;

const SECRET_REGEXP = /(password|code|token|authorization|authentication|cookie)/i;
const MASK_VALUE = '[MASKED]';

/** Recursively masks secret attributes in objects and arrays. */
function applyMasking(value: unknown): void {
  if (!isObject(value)) {
    return;
  }

  if (isArray(value)) {
    for (const item of value) {
      if (isObject(item)) {
        applyMasking(item);
      }
    }
    return;
  }

  const object = value as Record<string, unknown>;

  for (const key of Object.keys(object)) {
    if (SECRET_REGEXP.test(key)) {
      object[key] = MASK_VALUE;
      continue;
    }

    const val = object[key];

    if (isArray(val)) {
      for (const item of val) {
        if (isObject(item)) {
          applyMasking(item);
        }
      }
      continue;
    }

    if (isObject(val)) {
      applyMasking(val);
    }
  }
}

/**
 * Clones an object and recursively masks its secret attributes.
 *
 * ## Intent
 *
 * Produces a deep copy of the input with sensitive values replaced by `[MASKED]`.
 * Keys matching `password`, `code`, `token`, `authorization`, `authentication`, or
 * `cookie` (case‑insensitive, including substrings like `authToken` or `reset_code`)
 * are masked regardless of value type. The original object is never mutated.
 *
 * This enables safe logging and serialization of context, request payloads, or
 * config that may contain credentials, tokens, or other secrets.
 *
 * ## Use Cases
 *
 * 1. **Error logging**: Redact context (identity, query, mutation) before passing
 *    it to `logger.error` so logs never contain tokens or passwords.
 * 2. **Audit / debugging**: Serialize request or response data for storage or
 *    inspection without persisting secrets.
 * 3. **External forwarding**: Sanitize payloads before sending to support tools,
 *    monitoring, or third‑party APIs.
 * 4. **Tests and fixtures**: Derive safe snapshots from real data for assertions
 *    or documentation.
 *
 * ## Examples
 *
 * ### Basic usage
 *
 * ```typescript
 * const input = { user: 'alice', password: 'secret', role: 'admin' };
 * const safe = maskSecrets(input);
 *
 * console.log(safe);
 * // { user: 'alice', password: '[MASKED]', role: 'admin' }
 *
 * console.log(input.password);
 * // 'secret' — input unchanged
 * ```
 *
 * ### Nested objects and arrays
 *
 * ```typescript
 * const input = {
 *   requestId: 'req_1',
 *   identity: { userId: 'u1', token: 'jwt.xxx' },
 *   items: [{ id: 'a', code: 'promo' }]
 * };
 * const safe = maskSecrets(input);
 *
 * // safe.identity.token === '[MASKED]'
 * // safe.items[0].code === '[MASKED]'
 * ```
 *
 * ### Masking before logging
 *
 * ```typescript
 * const context = pick(ctx, ['query', 'mutation', 'identity', 'requestId']);
 * const safeContext = maskSecrets(context);
 * logger.error('Operation failed', { context: safeContext });
 * ```
 */
export default function maskSecrets(
  input: Record<string, unknown>
): Record<string, unknown> {
  const object = cloneDeep(input);
  applyMasking(object);
  return object;
}

// NOTE: Theoretically this method can be applied to every log entry. This
//       would require refactor of logger interface.
