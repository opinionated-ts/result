/** Detects \`any\` without widening other types. */
type NonNullish = object | string | number | bigint | boolean | symbol;

type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Rejects failure payload types that cannot describe a concrete, non-nullish value.
 * The tuple check treats unions as a whole instead of distributing over members.
 */
export type FailureValue<E> =
  IsAny<E> extends true ? never : unknown extends E ? never : [E] extends [NonNullish] ? E : never;

/**
 * The failed variant of a {@link Result}.
 *
 * Carries any concrete, non-nullish failure value; it does not have to be a JavaScript \`Error\`.
 *
 * @typeParam E - Type of the failure value.
 */
export type Failure<E = Error> = {
  error: E;
  ok: false;
};

/**
 * The successful variant of a {@link Result}.
 *
 * Carries the \`value\` produced on success; \`ok\` is always \`true\`.
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
 * Narrow with the \`ok\` field, or with {@link isSuccess} / {@link isFailure}.
 *
 * @typeParam T - Type of the value on success.
 * @typeParam E - Type of the failure value.
 */
export type Result<T, E = Error> = [FailureValue<E>] extends [never]
  ? never
  : Failure<E> | Success<T>;

/**
 * Resolves the canonical {@link Result} shape of a possibly nested value.
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
