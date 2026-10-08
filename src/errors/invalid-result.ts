// oxlint-disable-next-line no-unused-vars - used by tsdoc
import type { ResultError } from "@/types";

export const INVALID_RESULT_ERROR_CODE = "INVALID_RESULT_ERROR" as const;

export const INVALID_RESULT_ERROR_MESSAGE =
  "The provided value is not a valid Result error. It must extend Error and have an explicitly typed literal code." as const;

export class InvalidResultError extends Error {
  override readonly name = "InvalidResultError";
  override readonly message = INVALID_RESULT_ERROR_MESSAGE;
  readonly code = INVALID_RESULT_ERROR_CODE;

  constructor(options?: ErrorOptions) {
    super(INVALID_RESULT_ERROR_MESSAGE, options);
  }
}

export type InvalidResultErrorType = {
  readonly name: "InvalidResultError";
  readonly code: typeof INVALID_RESULT_ERROR_CODE;
  readonly message: typeof INVALID_RESULT_ERROR_MESSAGE;
} & Error;

/**
 * Creates an {@link InvalidResultError} for a value that cannot be represented
 * as a valid {@link ResultError}.
 *
 * The original value is preserved as the error's `cause`.
 *
 * @param cause - Original value thrown or rejected by the operation.
 * @param captureFrom - Function whose stack frame should be excluded from the
 *   resulting stack trace.
 * @returns An {@link InvalidResultError} representing the invalid failure.
 */
export function createInvalidResultError(
  cause: unknown,
  captureFrom: Function,
): InvalidResultError {
  const resultError = new InvalidResultError({ cause });

  Error.captureStackTrace?.(resultError, captureFrom);

  return resultError;
}

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

/**
 * Makes an error inherit the stack trace of its original cause when available.
 *
 * The error itself remains the failure value while preserving the original
 * stack location for diagnostics.
 *
 * @param error - Error that should inherit the cause's stack trace.
 * @param cause - Original value thrown or rejected by the operation.
 */
export function inheritCauseStack(error: Error, cause: unknown): void {
  if (cause instanceof Error && cause.stack !== undefined) {
    error.stack = cause.stack;
  }
}
