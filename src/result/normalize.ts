import type { Normalize } from "./types";

// oxlint-disable typescript/no-unsafe-type-assertion
import { success } from "./constructors";
import { isFailure, isSuccess } from "./guards";

/**
 * Normalizes `value` into its canonical {@link Result} shape.
 *
 * - {@link Failure} → preserved as-is (including failures nested in
 *   {@link Success}).
 * - {@link Success} → preserved, with its inner value normalized recursively
 *   (`Success<Success<T>>` → `Success<T>`).
 * - Anything else → wrapped in a {@link Success}.
 *
 * The return type mirrors this behavior through {@link Normalize}.
 *
 * @typeParam T - Type of the value to normalize.
 * @param value - Value to normalize.
 * @returns The canonical {@link Result} form of `value`.
 * @example
 * normalizeResult(42);                       // => { ok: true, value: 42 }
 * normalizeResult(success(success(42)));     // => { ok: true, value: 42 }
 * normalizeResult(success(failure(err)));    // => { ok: false, error: err }
 */
export function normalizeResult<T>(value: T): Normalize<T> {
  if (isFailure(value)) {
    return value as Normalize<T>;
  }

  if (isSuccess(value)) {
    const inner = value.value;

    if (isFailure(inner)) {
      return inner as Normalize<T>;
    }

    if (isSuccess(inner)) {
      return normalizeResult(inner) as Normalize<T>;
    }

    return value as Normalize<T>;
  }

  return success(value) as Normalize<T>;
}
