// oxlint-disable-next-line no-unused-vars - used by tsdoc
import type { tryResult, tryResultAsync } from "./try";
// oxlint-disable-next-line no-unused-vars - used by tsdoc
import type { Failure, Success, FailureValue, Result } from "./types";

import { isFailure } from "./guards";
import { normalizeResult } from "./normalize";

type NonNullish = object | string | number | bigint | boolean | symbol;

/**
 * Creates a {@link Success} result from `value`.
 *
 * The value is wrapped as-is. If it is already a result, it remains nested;
 * use {@link ok} or {@link normalizeResult} to flatten nested results.
 *
 * @param value - Value to wrap.
 * @returns A {@link Success} containing `value`.
 * @example
 * success(42);
 * // => { ok: true, value: 42 }
 *
 * success(success(42));
 * // => { ok: true, value: { ok: true, value: 42 } }
 */
export function success<T>(value: T): Success<T> {
  return { ok: true, value };
}

/**
 * Creates a {@link Failure} result from a concrete, non-nullish value.
 *
 * The original value is preserved as-is. It does not need to extend `Error`
 * or expose an error code.
 *
 * @param error_ - Failure value to wrap.
 * @returns A {@link Failure} containing `error_`.
 * @example
 * failure(new Error("failed"));
 * // => { ok: false, error: Error("failed") }
 *
 * failure("failed");
 * // => { ok: false, error: "failed" }
 */
export function failure<E>(error_: E & FailureValue<E>): Failure<E> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The generic constraint is enforced by FailureValue<E>; TypeScript cannot prove the conditional type here.
  return { error: error_, ok: false } as unknown as Failure<E>;
}

/**
 * Creates a failed result from a concrete, non-nullish value.
 *
 * The original value is preserved without requiring it to extend `Error` or
 * expose an error code. If `cause` is already a {@link Failure}, that failure
 * is returned unchanged.
 *
 * Designed for converting a known failure value into a {@link Result};
 * {@link tryResult} and {@link tryResultAsync} use it to capture thrown or
 * rejected values.
 *
 * @param cause - Failure value to preserve or wrap.
 * @returns A {@link Failure} containing `cause`, or the existing failure itself.
 * @example
 * error(new Error("failed"));
 * // => { ok: false, error: Error("failed") }
 *
 * error("failed");
 * // => { ok: false, error: "failed" }
 *
 * const result = error(error("failed"));
 * // => the existing failure is returned unchanged
 */
export function error<E extends NonNullish>(cause: Failure<E>): Failure<E>;
export function error<E>(cause: E & FailureValue<E>): Failure<E>;
export function error(cause: NonNullish | Failure<NonNullish>): Failure<NonNullish> {
  if (isFailure(cause)) {
    return cause;
  }

  return failure(cause);
}

/**
 * Creates a normalized {@link Result} from `value`.
 *
 * Existing results are normalized recursively: nested successes are flattened
 * and a failure is preserved, including when nested inside a success.
 * Non-result values become successful results.
 *
 * @param value - Value or result to normalize.
 * @returns The canonical {@link Result} form of `value`.
 * @example
 * ok(42);
 * // => { ok: true, value: 42 }
 *
 * ok(success(42));
 * // => { ok: true, value: 42 }
 *
 * ok(success(error("failed")));
 * // => { ok: false, error: "failed" }
 */
export function ok<T>(value: T) {
  return normalizeResult(value);
}
