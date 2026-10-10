import { error } from "./constructors";
import { normalizeResult } from "./normalize";

type NonNullish = object | string | number | bigint | boolean | symbol;

/**
 * Runs a synchronous factory, converting its outcome into a {@link Result}.
 *
 * - Returns → normalized with {@link normalizeResult} (an existing {@link Result}
 *   is preserved).
 * - Throws → preserved as the failure value.
 *
 * Safe wrapper around code that may throw.
 *
 * @typeParam T - Type of the value returned by `factory`.
 * @param factory - Synchronous function to run.
 * @returns A {@link Success} with the normalized value, or a {@link Failure}
 * with the caught error.
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
 * Runs an async factory, converting its outcome into a {@link Result}.
 *
 * Same semantics as {@link tryResult}, but for promises:
 *
 * - Resolves → normalized with {@link normalizeResult} (an existing {@link Result}
 *   is preserved).
 * - Rejects → preserved as the failure value.
 *
 * @typeParam T - Type of the value resolved by `factory`.
 * @param factory - Async function to run.
 * @returns A promise of a {@link Success} with the normalized value, or a
 * {@link Failure} with the caught error.
 * @example
 * const result = await tryResultAsync(() => fetch(url).then((r) => r.json()));
 */
export async function tryResultAsync<T>(factory: () => Promise<T>) {
  try {
    return normalizeResult(await factory());
  } catch (error_) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Preserve arbitrary JavaScript thrown values; the public Result contract excludes nullish failures.
    return error(error_ as NonNullish);
  }
}
