export {
  InvalidResultError,
  INVALID_RESULT_ERROR_CODE,
  type InvalidResultErrorType,
} from "./errors/invalid-result";

export { error, failure, success, ok } from "./constructors";

export { isFailure, isSuccess } from "./guards";

export { normalizeResult } from "./normalize";

export { tryResult, tryResultAsync } from "./try";

export type { Failure, Normalize, NormalizedResult, Result, Success } from "./types";
