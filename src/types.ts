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
