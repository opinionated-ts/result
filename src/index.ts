export { NULLISH_FAILURE_ERROR_MESSAGE, NullishFailureError } from "./errors/nullish-failure";

export { error, ok } from "./constructors";

export { isFailure, isSuccess } from "./guards";

export { normalizeResult } from "./normalize";

export { tryResult, tryResultAsync } from "./try";

export type { Failure, FailureValue, NormalizedResult, Result, Success } from "./types";
