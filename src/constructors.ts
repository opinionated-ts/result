// oxlint-disable-next-line no-unused-vars - used by tsdoc
import type { tryResult, tryResultAsync } from "./try";
import type { Failure, Success, FailureValue } from "./types";

import { isFailure } from "./guards";
import { normalizeResult } from "./normalize";

type NonNullish = object | string | number | bigint | boolean | symbol;

/**
 * Creates a {@link Success} result from `value`.
 *
 * No normalization is performed: an existing result is wrapped as-is.
 * Use {@link normalizeResult} to flatten nested results.
 *
 * @param value - Value to wrap.
 * @returns A {@link Success} containing `value`.
 */
export function success<T>(value: T): Success<T> {
  return { ok: true, value };
}

/**
 * Creates a {@link Failure} result from any concrete, non-nullish value.
 *
 * The original value is preserved as-is; it does not need to extend `Error`.
 *
 * @param error_ - Failure value to wrap.
 * @returns A {@link Failure} containing `error_`.
 */
export function failure<E>(error_: E & FailureValue<E>): Failure<E> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The generic constraint is enforced by FailureValue<E>; TypeScript cannot prove the conditional type here.
  return { error: error_, ok: false } as unknown as Failure<E>;
}

/**
 * Creates a failed result from any concrete, non-nullish value.
 *
 * The original value is preserved without requiring it to extend `Error`.
 * If `cause` is already a {@link Failure}, it is returned unchanged.
 *
 * @param cause - Failure value to preserve or wrap.
 * @returns A {@link Failure} containing `cause`, or the existing failure itself.
 */
export function error<E extends NonNullish>(cause: Failure<E>): Failure<E>;
export function error<E>(cause: E & FailureValue<E>): Failure<E>;
export function error(cause: unknown): Failure<NonNullish> {
  if (isFailure(cause)) {
    return cause;
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime input is unknown; preserve it as-is while exposing the documented non-nullish contract.
  return failure(cause as NonNullish);
}

/**
 * Creates a normalized {@link Result} from `value`.
 *
 * Existing result values are normalized recursively: nested results are
 * flattened and failures are preserved.
 *
 * @param value - Value or result to normalize.
 * @returns A normalized result.
 */
export function ok<T>(value: T) {
  return normalizeResult(value);
}
