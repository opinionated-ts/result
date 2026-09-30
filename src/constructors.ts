import { UnknownError, type UnknownErrorType } from "@/errors/unknown";

// oxlint-disable-next-line no-unused-vars - used by tsdoc
import type { Failure, Success, Result } from "./types";

import { isFailure } from "./guards";
import { normalizeResult } from "./normalize";
// oxlint-disable-next-line no-unused-vars - used by tsdoc
import { tryResult, tryResultAsync } from "./try";

/**
 * Creates a {@link Success} result from `value`.
 *
 * No normalization is performed: an existing {@link Result} is wrapped as-is.
 * Use {@link normalizeResult} to flatten nested results.
 *
 * @typeParam T - Type of the successful value.
 * @param value - Value to wrap.
 * @returns A {@link Success} containing `value`.
 * @example
 * const result = success(42);
 * // => { ok: true, value: 42 }
 */
export function success<T>(value: T): Success<T> {
  return {
    ok: true,
    value,
  };
}

/**
 * Creates a {@link Failure} result from `error_`.
 *
 * The error instance is preserved as-is.
 *
 * @typeParam E - Error type, constrained to `Error`.
 * @param error_ - Error to wrap.
 * @returns A {@link Failure} containing `error_`.
 * @example
 * const result = failure(new Error("failed"));
 * // => { ok: false, error: Error("failed") }
 */
export function failure<E extends Error>(error_: E): Failure<E> {
  return {
    error: error_,
    ok: false,
  };
}

/**
 * Creates a normalized {@link Failure} from any value.
 *
 * - Existing {@link Failure} values are preserved as-is.
 * - `Error` values are preserved as-is.
 * - Anything else is wrapped in a {@link UnknownError}, keeping the original
 *   value in its `cause` property.
 *
 * Designed for `catch` blocks; used internally by {@link tryResult} and
 * {@link tryResultAsync}.
 *
 * @param cause - The cause of the failure.
 * @returns A normalized {@link Failure}.
 * @example
 * error(new Error("failed"));
 * // => { ok: false, error: Error("failed") }
 *
 * error("failed");
 * // => { ok: false, error: UnknownError { cause: "failed" } }
 *
 * error(error(new Error("failed")));
 * // => { ok: false, error: Error("failed") }
 */
export function error<E extends Error>(cause: Failure<E>): Failure<E>;
export function error<E extends Error>(cause: E): Failure<E>;
export function error(cause: unknown): Failure<UnknownErrorType>;
export function error(cause: unknown): Failure {
  if (isFailure(cause)) {
    return cause;
  }

  if (cause instanceof Error) {
    return failure(cause);
  }

  return failure(UnknownError({ cause }));
}

/**
 * Creates a normalized {@link Result} from `value`.
 *
 * Existing {@link Result} values are normalized recursively:
 * nested results are flattened, and failures are preserved.
 *
 * @param value - Value or {@link Result} to normalize.
 * @returns A normalized {@link Result}.
 * @example
 * ok(42);
 * // => { ok: true, value: 42 }
 *
 * ok(ok(42));
 * // => { ok: true, value: 42 }
 *
 * ok(ok(error(new Error("failed"))));
 * // => { ok: false, error: Error("failed") }
 */
export function ok<T>(value: T) {
  return normalizeResult(value);
}
