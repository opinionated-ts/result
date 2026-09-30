import { createError } from "@opinionated-ts/error-factory";

export const UNKNOWN_ERROR_CODE = "UNKNOWN_ERROR";

export const UnknownError = createError({
  name: "UnknownError",
  defaults: {
    message: "An unknown error occurred",
  },
  fixed: {
    code: UNKNOWN_ERROR_CODE,
  },
});

export type UnknownErrorType = ReturnType<typeof UnknownError>;
