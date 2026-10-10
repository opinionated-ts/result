import { InvalidResultError, type InvalidResultErrorType } from "@/errors/invalid-result";
import { isResultError } from "@/errors/result-error";
// oxlint-disable-next-line no-unused-vars - used by tsdoc
import { tryResultAsync } from "@/try/async";
// oxlint-disable-next-line no-unused-vars - used by tsdoc
import { tryResult } from "@/try/sync";

// oxlint-disable-next-line no-unused-vars - used by tsdoc
import type { Failure, Success, Result, ResultError, ExactCode } from "./types";

import { isFailure } from "./guards";
import { normalizeResult } from "./normalize";

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

type ValidatedErrorCause<T> = T extends ResultError
  ? ExactCode<T>
  : T extends Failure<infer E>
    ? E extends ResultError
      ? ExactCode<E> extends Error
        ? Failure<E>
        : never
      : unknown
    : unknown;

/**
 * Creates a normalized {@link Failure} from any value.
 *
 * - Existing {@link Failure} values are preserved as-is.
 * - `Error` values are preserved as-is at runtime.
 * - Typed error values must extend `Error` and expose an explicitly typed literal
 *   `code`; a widened `string` code is rejected to preserve the exact contract.
 * - Anything else is wrapped in a {@link InvalidResultError}, keeping the original
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
 * // => { ok: false, error: InvalidResultError { cause: "failed" } }
 *
 * error(error(new Error("failed")));
 * // => { ok: false, error: Error("failed") }
 */

export function error<E extends ResultError>(
  cause: Failure<E> & (ExactCode<E> extends Error ? unknown : never),
): Failure<E>;
export function error<E extends ResultError>(cause: E & ExactCode<E>): Failure<E>;
export function error<T>(cause: T & ValidatedErrorCause<T>): Failure<InvalidResultErrorType>;
export function error(cause: unknown): Failure {
  if (isFailure(cause)) {
    return cause;
  }

  if (isResultError(cause)) {
    return failure(cause);
  }

  return failure(new InvalidResultError({ cause }));
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
