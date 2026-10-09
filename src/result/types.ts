/**
 * The failed variant of a {@link Result}.
 *
 * Carries the `error` that caused the failure; `ok` is always `false`.
 *
 * @typeParam E - Error type, constrained to `Error`.
 */
export type Failure<E extends Error = Error> = {
  error: E;
  ok: false;
};

/**
 * The successful variant of a {@link Result}.
 *
 * Carries the `value` produced on success; `ok` is always `true`.
 *
 * @typeParam T - Type of the successful value.
 */
export type Success<T> = {
  ok: true;
  value: T;
};

/**
 * Discriminated union representing the outcome of an operation.
 *
 * | Variant   | Discriminator | Payload   |
 * | --------- | ------------- | --------- |
 * | {@link Success} | `ok: true`  | `value`   |
 * | {@link Failure} | `ok: false` | `error`   |
 *
 * Narrow with the `ok` field, or with {@link isSuccess} / {@link isFailure}.
 *
 * @typeParam T - Type of the value on success.
 * @typeParam E - Error type on failure, constrained to `Error`.
 */
export type Result<T, E extends Error = Error> = Failure<E> | Success<T>;

/**
 * Resolves the canonical {@link Result} shape of a possibly nested value.
 *
 * | Input                         | Output                  |
 * | ----------------------------- | ----------------------- |
 * | `Failure<E>`                  | `Failure<E>`            |
 * | `Success<T>`                  | `Normalize<T>`          |
 * | `T` (anything else)           | `Success<T>`            |
 *
 * @typeParam T - Type to normalize.
 */
export type Normalize<T> =
  T extends Failure<infer E> ? Failure<E> : T extends Success<infer U> ? Normalize<U> : Success<T>;

/**
 * Alias of {@link Normalize}, naming the canonical shape of a normalized value.
 *
 * @typeParam T - Type to normalize.
 */
export type NormalizedResult<T> = Normalize<T>;

/**
 * Error shape required by {@link error} for typed result failures.
 *
 * The `code` property is constrained to a string so the constructor can
 * preserve literal error codes in its return type.
 */
export type ResultError = Error & {
  readonly code: string;
};

/**
 * Fallback type used when an error exposes a widened `string` code instead of
 * a string literal.
 */
type ErrorCodeMustBeLiteralString = {
  readonly code: never;
};

/**
 * Preserves an error type only when its `code` property is a string literal.
 *
 * A widened `string` code resolves to {@link ErrorCodeMustBeLiteralString},
 * preventing the constructor from losing the exact error-code contract.
 */
export type ExactCode<E extends ResultError> = string extends E["code"]
  ? ErrorCodeMustBeLiteralString
  : E;

/**
 * Maps a thrown or rejected value to a typed {@link ResultError}.
 *
 * The returned error must extend `Error` and expose an explicitly typed
 * literal `code`, preserving the exact error type for the resulting
 * {@link Failure}.
 *
 * @typeParam E - Type of the mapped {@link ResultError}.
 * @param cause - Original value thrown or rejected by the operation.
 * @returns A typed error representing the failure.
 */
export type ErrorMapper<E extends ResultError> = (cause: unknown) => ExactCode<E>;
