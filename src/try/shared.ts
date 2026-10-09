import type { ResultError } from "@/result/types";

import { inheritCauseStack } from "@/errors/error-stack";
import { createInvalidResultError, InvalidResultError } from "@/errors/invalid-result";
import { isResultError } from "@/errors/result-error";
import { failure } from "@/result/constructors";
import { normalizeResult } from "@/result/normalize";

import type { Mapper, TryResultOptions } from "./types";

import { isFailure } from "../result/guards";

/**
 * Creates the fallback error for a failure that cannot be represented by a
 * valid {@link ResultError}.
 *
 * @param cause - Original thrown or rejected value.
 * @param options - Settings that control stack inheritance.
 * @param captureFrom - Function whose stack frame should be excluded.
 * @returns An {@link InvalidResultError} preserving the original cause.
 */
function createTryResultError(
  cause: unknown,
  options: TryResultOptions,
  captureFrom: Function,
): InvalidResultError {
  const error = createInvalidResultError(cause, captureFrom);

  if (options.inheritStack !== false) inheritCauseStack(error, cause);

  return error;
}

/**
 * Maps a failure cause to a valid {@link ResultError}, falling back to an
 * {@link InvalidResultError} when no valid mapped error is produced.
 *
 * If the mapper throws, its error becomes the cause of the fallback
 * {@link InvalidResultError}.
 *
 * @param cause - Original thrown or rejected value.
 * @param onError - Optional mapper for the failure cause.
 * @param options - Settings that control stack inheritance.
 * @param captureFrom - Function whose stack frame should be excluded.
 * @returns The mapped error or an {@link InvalidResultError} fallback.
 */
function mapError(
  cause: unknown,
  onError: Mapper | undefined,
  options: TryResultOptions,
  captureFrom: Function,
): ResultError {
  if (onError) {
    try {
      const mapped = onError(cause);

      if (isResultError(mapped)) {
        if (options.inheritStack !== false) inheritCauseStack(mapped, cause);
        return mapped;
      }
    } catch (mapperCause) {
      return createTryResultError(mapperCause, options, captureFrom);
    }
  }

  return createTryResultError(cause, options, captureFrom);
}

/**
 * Converts a thrown or rejected value into a valid {@link Failure}.
 *
 * Existing valid result errors are preserved; invalid failure values are
 * mapped or wrapped in an {@link InvalidResultError}.
 *
 * @param value - Value thrown or rejected by the operation.
 * @param onError - Optional mapper for invalid failure values.
 * @param options - Settings that control stack inheritance.
 * @param captureFrom - Function whose stack frame should be excluded.
 * @returns A failure containing a valid result error.
 */
export function processFailure(
  value: unknown,
  onError: Mapper | undefined,
  options: TryResultOptions,
  captureFrom: Function,
) {
  if (isFailure(value)) {
    if (isResultError(value.error)) return value;

    // Use the invalid inner error as the mapper input and stack source.
    return failure(mapError(value.error, onError, options, captureFrom));
  }

  if (value instanceof Error) {
    if (isResultError(value)) return failure(value);

    return failure(mapError(value, onError, options, captureFrom));
  }

  return failure(mapError(value, onError, options, captureFrom));
}

/**
 * Validates and normalizes a value returned by the operation.
 *
 * @param value - Value returned by the operation.
 * @param onError - Optional mapper for invalid failure values.
 * @param options - Settings that control stack inheritance.
 * @param captureFrom - Function whose stack frame should be excluded.
 * @returns The normalized success or failure result.
 */
export function processReturned<T>(
  value: T,
  onError: Mapper | undefined,
  options: TryResultOptions,
  captureFrom: Function,
) {
  if (isFailure(value) || value instanceof Error) {
    return processFailure(value, onError, options, captureFrom);
  }

  const normalized = normalizeResult(value);

  // A Success can contain a Failure; validate that Failure's inner error too.
  if (isFailure(normalized)) {
    return processFailure(normalized, onError, options, captureFrom);
  }

  return normalized;
}
