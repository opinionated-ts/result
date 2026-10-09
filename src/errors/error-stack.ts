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
  /* istanbul ignore else -- @preserve */
  if (cause instanceof Error && cause.stack !== undefined) {
    error.stack = cause.stack;
  }
}
