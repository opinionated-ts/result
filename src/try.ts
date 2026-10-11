import type { Failure, FailureValue, Normalize } from "./types";

import { error } from "./constructors";
import { NullishFailureError } from "./errors/nullish-failure";
import { normalizeResult } from "./normalize";

export type NonNullish = object | string | number | bigint | boolean | symbol;

export interface TryResultOptions {
  /**
   * When the mapper returns an `Error` and the caught cause is also an `Error`,
   * copy the cause's stack to the mapped error. Defaults to `true`.
   */
  readonly inheritStack?: boolean;
}

export type FailureMapper<E> = (cause: unknown) => E & FailureValue<E>;

/**
 * Runs a synchronous factory and converts its outcome into a {@link Result}.
 *
 * - Returned values are normalized with {@link normalizeResult}.
 * - Thrown values are passed to `mapper`, when provided, and its returned
 *   failure value is preserved as-is.
 * - Without a mapper, the thrown value is wrapped as a failure as-is.
 *
 * The mapper receives the original thrown value as `cause` and must return a
 * concrete, non-nullish failure value. TypeScript rejects invalid return types.
 *
 * @param factory - Synchronous function to run.
 * @param mapper - Optional function that maps the thrown value to a failure.
 * @param options - Optional behavior settings.
 * @returns The normalized result, or a failure containing the mapped/thrown value.
 * @example
 * const result = tryResult(
 *   () => JSON.parse(input),
 *   (cause) => new SyntaxError("Invalid JSON", { cause }),
 * );
 */
export function tryResult<T>(factory: () => T): Normalize<T> | Failure<NonNullish>;
export function tryResult<T, E>(
  factory: () => T,
  mapper: FailureMapper<E>,
  options?: TryResultOptions,
): Normalize<T> | Failure<E>;
export function tryResult<T, E>(
  factory: () => T,
  mapper?: FailureMapper<E>,
  options: TryResultOptions = {},
) {
  try {
    return normalizeResult(factory());
  } catch (cause) {
    if (!mapper) {
      if (cause === null || cause === undefined) {
        throw new NullishFailureError(cause);
      }

      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Nullish values are rejected above; preserve other thrown values.
      return error(cause as NonNullish);
    }

    const mapped = mapper(cause);

    if (
      options.inheritStack !== false &&
      mapped instanceof Error &&
      cause instanceof Error &&
      cause.stack !== undefined
    ) {
      mapped.stack = cause.stack;
    }

    return error<E>(mapped);
  }
}

/**
 * Runs an async factory and converts its outcome into a {@link Result}.
 *
 * It has the same semantics as {@link tryResult}, but awaits the factory:
 * resolved values are normalized, and rejected values are passed to `mapper`
 * when provided. Without a mapper, the rejected value is wrapped as-is.
 *
 * The mapper receives the original rejected value as `cause` and must return a
 * concrete, non-nullish failure value. TypeScript rejects invalid return types.
 *
 * @param factory - Async function to run.
 * @param mapper - Optional function that maps the rejected value to a failure.
 * @param options - Optional behavior settings.
 * @returns A promise of the normalized result or a failure.
 * @example
 * const result = await tryResultAsync(
 *   () => fetchUser(id),
 *   (cause) => new UserLoadError("Could not load user", { cause }),
 * );
 */
export function tryResultAsync<T>(
  factory: () => Promise<T>,
): Promise<Normalize<T> | Failure<NonNullish>>;
export function tryResultAsync<T, E>(
  factory: () => Promise<T>,
  mapper: FailureMapper<E>,
  options?: TryResultOptions,
): Promise<Normalize<T> | Failure<E>>;
export async function tryResultAsync<T, E>(
  factory: () => Promise<T>,
  mapper?: FailureMapper<E>,
  options: TryResultOptions = {},
) {
  try {
    return normalizeResult(await factory());
  } catch (cause) {
    if (!mapper) {
      if (cause === null || cause === undefined) {
        throw new NullishFailureError(cause);
      }

      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Nullish values are rejected above; preserve other rejected values.
      return error(cause as NonNullish);
    }

    const mapped = mapper(cause);

    if (
      options.inheritStack !== false &&
      mapped instanceof Error &&
      cause instanceof Error &&
      cause.stack !== undefined
    ) {
      mapped.stack = cause.stack;
    }

    return error<E>(mapped);
  }
}
