import type { Mapper, TryResultOptions, TryResultOutput } from "./types";

import { processFailure, processReturned } from "./shared";

/**
 * Wraps an asynchronous operation in a {@link Result}.
 *
 * Resolved values become success results, while rejected values become
 * failures. An optional mapper converts invalid failure values into typed
 * errors; if it throws, its error becomes the cause of an
 * {@link InvalidResultError}.
 *
 * @typeParam T - Value type resolved by the operation.
 * @typeParam M - Optional mapper type used to infer the failure type.
 * @param factory - Asynchronous operation to execute.
 * @param onError - Optional mapper that converts a failure cause into a typed error.
 * @param options - Optional behavior settings.
 * @returns A promise resolving to the operation's result.
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
