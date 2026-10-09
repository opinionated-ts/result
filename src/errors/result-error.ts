import type { ResultError } from "@/result/types";

/**
 * Checks whether a value satisfies the runtime shape of a {@link ResultError}.
 *
 * A valid result error must be an {@link Error} with a string `code`.
 * The exact literal type of `code` is enforced by TypeScript at compile time
 * and cannot be verified at runtime.
 *
 * @param value - Value to check.
 * @returns `true` when `value` is a {@link ResultError}; otherwise `false`.
 */
export function isResultError(value: unknown): value is ResultError {
  return value instanceof Error && "code" in value && typeof value.code === "string";
}
