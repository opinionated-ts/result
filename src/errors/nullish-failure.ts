export const NULLISH_FAILURE_ERROR_MESSAGE =
  "Expected a non-nullish failure value, but received {cause}." as const;

export class NullishFailureError extends TypeError {
  override readonly name = "NullishFailureError";

  constructor(cause: null | undefined) {
    super(NULLISH_FAILURE_ERROR_MESSAGE.replace("{cause}", String(cause)), { cause });
  }
}
