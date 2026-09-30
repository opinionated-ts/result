// oxlint-disable typescript/no-unsafe-type-assertion
import type { Failure, Success } from "./types";

/**
 * Type guard that checks whether `value` is a {@link Failure}.
 *
 * Structural check: a non-null object with an `error` property and
 * `ok === false`. On `true`, narrows `value` to {@link Failure}.
 *
 * @param value - Value to test.
 * @returns `true` if `value` is a {@link Failure}.
 * @example
 * if (isFailure(result)) {
 *   console.error(result.error);
 * }
 */
export function isFailure(value: unknown): value is Failure {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    (value as { ok?: unknown }).ok === false
  );
}

/**
 * Type guard that checks whether `value` is a {@link Success}.
 *
 * Structural check: a non-null object with a `value` property and
 * `ok === true`. On `true`, narrows `value` to {@link Success}.
 *
 * @param value - Value to test.
 * @returns `true` if `value` is a {@link Success}.
 * @example
 * if (isSuccess(result)) {
 *   console.log(result.value);
 * }
 */
export function isSuccess(value: unknown): value is Success<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    (value as { ok?: unknown }).ok === true
  );
}
