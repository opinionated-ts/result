import type { ErrorMapper, ResultError } from "@/types";
// oxlint-disable-next-line no-unused-vars - used by tsdoc
import type { Failure, Result, Success } from "@/types";

import { failure } from "@/constructors";
import {
  createInvalidResultError,
  inheritCauseStack,
  InvalidResultError,
  isResultError,
} from "@/errors/invalid-result";
import { normalizeResult } from "@/normalize";

export interface TryResultOptions {
  /**
   * When true, a mapped error inherits the stack of its original cause.
   *
   * Defaults to true.
   */
  readonly inheritStack?: boolean;
}

/**
 * Wraps a synchronous operation in a {@link Result}.
 *
 * Use this when an operation can either return a value or throw an error:
 * successful values become {@link Success} results, while thrown errors become
 * {@link Failure} results.
 *
 * If `onError` is provided, it maps the thrown value to the typed error
 * returned by the mapper. The mapper receives the original thrown value as
 * `cause`, and its return type becomes the failure type of the resulting
 * {@link Result}.
 *
 * The mapped error must extend `Error` and expose an explicitly typed literal
 * `code`. This preserves the exact error type in the resulting `Failure`.
 *
 * If `onError` is omitted, thrown values are represented by
 * {@link InvalidResultError}.
 *
 * @param factory - Operation to execute.
 * @param onError - Optional mapper that converts a thrown value into a typed
 *   error.
 * @param options - Optional behavior settings.
 * @returns A {@link Result} containing the operation's success or failure.
 *
 * @example
 * const result = tryResult(
 *   () => database.findUser(id),
 *   (cause) => new UserLoadFailedError("Could not load user.", { cause }),
 * );
 *
 * // Success<User> | Failure<UserLoadFailedError>
 *
 * @example
 * const result = tryResult(() => database.findUser(id));
 *
 * // Success<User> | Failure<InvalidResultError>
 */
export function tryResult<T, E extends ResultError = InvalidResultError>(
  factory: () => T,
  onError?: ErrorMapper<E>,
  options: TryResultOptions = {},
) {
  try {
    return normalizeResult(factory());
  } catch (cause) {
    const mappedError = onError?.(cause);

    if (mappedError === undefined || !isResultError(mappedError)) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion - runtime validation guarantees the ResultError contract
      return failure(createInvalidResultError(cause, tryResult) as E);
    }

    if (options.inheritStack !== false) {
      inheritCauseStack(mappedError, cause);
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion - runtime validation guarantees the ResultError contract
    return failure(mappedError as E);
  }
}

/**
 * Wraps an asynchronous operation in a {@link Result}.
 *
 * Use this when an operation can either resolve to a value or reject with an
 * error: resolved values become {@link Success} results, while rejected errors
 * become {@link Failure} results.
 *
 * If `onError` is provided, it maps the rejected value to the typed error
 * returned by the mapper. The mapper receives the original rejection value as
 * `cause`, and its return type becomes the failure type of the resulting
 * {@link Result}.
 *
 * The mapped error must extend `Error` and expose an explicitly typed literal
 * `code`. This preserves the exact error type in the resulting `Failure`.
 *
 * If `onError` is omitted, rejected values are represented by
 * {@link InvalidResultError}.
 *
 * @param factory - Asynchronous operation to execute.
 * @param onError - Optional mapper that converts a rejected value into a typed
 *   error.
 * @param options - Optional behavior settings.
 * @returns A {@link Result} containing the operation's success or failure.
 *
 * @example
 * const result = await tryResultAsync(
 *   () => database.findUser(id),
 *   (cause) => new UserLoadFailedError("Could not load user.", { cause }),
 * );
 *
 * // Success<User> | Failure<UserLoadFailedError>
 *
 * @example
 * const result = await tryResultAsync(() => database.findUser(id));
 *
 * // Success<User> | Failure<InvalidResultError>
 */
export async function tryResultAsync<T, E extends ResultError = InvalidResultError>(
  factory: () => Promise<T>,
  onError?: ErrorMapper<E>,
  options: TryResultOptions = {},
) {
  try {
    return normalizeResult(await factory());
  } catch (cause) {
    const mappedError = onError?.(cause);

    if (mappedError === undefined || !isResultError(mappedError)) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion - runtime validation guarantees the ResultError contract
      return failure(createInvalidResultError(cause, tryResult) as E);
    }

    if (options.inheritStack !== false) {
      inheritCauseStack(mappedError, cause);
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion - runtime validation guarantees the ResultError contract
    return failure(mappedError as E);
  }
}
