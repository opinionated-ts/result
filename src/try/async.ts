import type { Mapper, TryResultOptions, TryResultOutput } from "./types";

import { processFailure, processReturned } from "./shared";

/**
 * Wraps an asynchronous operation in a {@link Result}.
 *
 * Resolved values are normalized into {@link Success} results. Rejected
 * values become {@link Failure} results, mapped to a typed error when possible.
 *
 * The mapped error must extend `Error` and expose an explicitly typed literal
 * `code`, preserving its exact type in the resulting `Failure`.
 *
 * If `onError` is omitted or returns an invalid error, the failure is
 * represented by {@link InvalidResultError}. If the mapper throws, its error
 * becomes the cause of that `InvalidResultError`.
 *
 * @typeParam T - Value resolved by the operation.
 * @typeParam M - Optional mapper type used to infer the failure type.
 * @param factory - Asynchronous operation to execute.
 * @param onError - Optional mapper that converts a rejection cause into a typed error.
 * @param options - Optional behavior settings.
 * @returns A promise resolving to a {@link Result} containing the operation's success or failure.
 *
 * @example
 * const result = await tryResultAsync(
 * () => database.findUser(id),
 * (cause) => new UserLoadFailedError("Could not load user.", { cause }),
 * );
 *
 * // Success<User> | Failure<UserLoadFailedError>
 *
 * @example
 * const result = await tryResultAsync(() => database.findUser(id));
 *
 * // Success<User> | Failure<InvalidResultError>
 */
export async function tryResultAsync<T, M extends Mapper | undefined = Mapper>(
  factory: () => Promise<T>,
  onError?: M,
  options: TryResultOptions = {},
): Promise<TryResultOutput<T, M>> {
  try {
    return processReturned(await factory(), onError, options, tryResultAsync) as TryResultOutput<
      T,
      M
    >;
  } catch (cause) {
    return processFailure(cause, onError, options, tryResultAsync) as TryResultOutput<T, M>;
  }
}
