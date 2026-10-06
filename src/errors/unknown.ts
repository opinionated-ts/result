import { createError } from "@opinionated-ts/error-factory";

export const INVALID_RESULT_ERROR_CODE = "INVALID_RESULT_ERROR";

export const InvalidResultError = createError({
  name: "InvalidResultError",
  defaults: {
    message:
      "The provided value is not a valid Result error. It must extend Error and have an explicitly typed literal code.",
  },
  fixed: {
    code: INVALID_RESULT_ERROR_CODE,
  },
});

export type InvalidResultErrorType = ReturnType<typeof InvalidResultError>;
