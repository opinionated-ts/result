// oxlint-disable-next-line no-unused-vars - used by tsdoc
import type { ResultError } from "@/result/types";

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
