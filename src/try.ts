import { error } from "./constructors";
import { normalizeResult } from "./normalize";

type NonNullish = object | string | number | bigint | boolean | symbol;

/**
 * Runs a synchronous factory and converts its outcome into a {@link Result}.
 *
 * - Returns are normalized with {@link normalizeResult}; an existing result is
 *   preserved and nested successes are flattened.
 * - Thrown values are preserved as the failure payload, without requiring an
 *   `Error` instance or an error code.
 *
 * Use this to contain exceptions from synchronous operations and handle them
 * through the returned result instead of a surrounding `try`/`catch`.
 *
 * @param factory - Synchronous function to run.
 * @returns A {@link Success} with the normalized value, or a {@link Failure}
 *   with the thrown value.
 * @example
 * const result = tryResult(() => JSON.parse(input));
 */
export function tryResult<T>(factory: () => T) {
  try {
    return normalizeResult(factory());
  } catch (error_) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Preserve arbitrary JavaScript thrown values; the public Result contract excludes nullish failures.
    return error(error_ as NonNullish);
  }
}

/**
 * Runs an async factory and converts its outcome into a {@link Result}.
 *
 * It has the same semantics as {@link tryResult}, but awaits the factory:
 *
 * - Resolved values are normalized with {@link normalizeResult}.
 * - Rejected values are preserved as the failure payload, without requiring an
 *   `Error` instance or an error code.
 *
 * @param factory - Async function to run.
 * @returns A promise of a {@link Success} with the normalized value, or a
 *   {@link Failure} with the rejected value.
 * @example
 * const result = await tryResultAsync(() => fetch(url).then((response) => response.json()));
 */
export async function tryResultAsync<T>(factory: () => Promise<T>) {
  try {
    return normalizeResult(await factory());
  } catch (error_) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Preserve arbitrary JavaScript thrown values; the public Result contract excludes nullish failures.
    return error(error_ as NonNullish);
  }
}
