import type {
  ExactFactoryReturn,
  ExactMapper,
  Mapper,
  TryResultOptions,
  TryResultOutput,
} from "./types";

import { processFailure, processReturned } from "./shared";

/**
 * Wraps a synchronous operation in a {@link Result}.
 *
 * Returned values are normalized into {@link Success} results. Thrown values
 * become {@link Failure} results, mapped to a typed error when possible.
 *
 * The mapped error must extend `Error` and expose an explicitly typed literal
 * `code`, preserving its exact type in the resulting `Failure`.
 *
 * If `onError` is omitted or returns an invalid error, the failure is
 * represented by {@link InvalidResultError}. If the mapper throws, its error
 * becomes the cause of that `InvalidResultError`.
 *
 * @typeParam T - Value returned by the operation.
 * @typeParam M - Optional mapper type used to infer the failure type.
 * @param factory - Synchronous operation to execute.
 * @param onError - Optional mapper that converts a thrown value into a typed error.
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
export function tryResult<T, M extends Mapper | undefined = Mapper>(
  factory: () => T & ExactFactoryReturn<T>,
  onError?: M & ExactMapper<M>,
  options: TryResultOptions = {},
): TryResultOutput<T, M> {
  try {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime validation normalizes the broader implementation result.
    return processReturned(factory(), onError, options, tryResult) as TryResultOutput<T, M>;
  } catch (cause) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime validation normalizes the broader implementation result.
    return processFailure(cause, onError, options, tryResult) as TryResultOutput<T, M>;
  }
}
