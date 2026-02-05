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
 * Produces a deep copy of the input with sensitive values replaced by `[MASKED]`.
 * Keys matching `password`, `code`, `token`, `authorization`, `authentication`, or
 * `cookie` (case‑insensitive, including substrings like `authToken` or `reset_code`)
 * are masked regardless of value type. The original object is never mutated.
 *
 * This enables safe logging and serialization of context, request payloads, or
 * config that may contain credentials, tokens, or other secrets.
 */
export default function maskSecrets(
  input: Record<string, unknown>
): Record<string, unknown> {
  const object = cloneDeep(input);
  applyMasking(object);
  return object;
}
