import type { InvalidResultError } from "@/errors/invalid-result";
import type { ExactCode, Failure, Normalize, ResultError } from "@/result/types";

/** Configuration shared by {@link tryResult} and {@link tryResultAsync}. */
export interface TryResultOptions {
  /** When true, errors inherit the stack from the cause used to create them. Defaults to true. */
  readonly inheritStack?: boolean;
}

/** Converts an unknown failure cause into a candidate result error. */
export type Mapper = (cause: unknown) => ResultError;

/**
 * Requires mapper errors to expose an exact string-literal `code`.
 *
 * Uses {@link ExactCode} so a widened `string` code is rejected by TypeScript.
 */
export type ExactMapper<M> = M extends (cause: unknown) => infer E
  ? E extends ResultError
    ? (cause: unknown) => ExactCode<E>
    : never
  : M;

/** Requires directly returned typed errors to expose an exact literal `code`. */
export type ExactFactoryReturn<T> = T extends ResultError ? ExactCode<T> : T;

/** Infers the mapper's valid error type, falling back to {@link InvalidResultError}. */
export type MapperError<M> = M extends (cause: unknown) => infer E
  ? [E] extends [never]
    ? InvalidResultError
    : E extends ResultError
      ? string extends E["code"]
        ? InvalidResultError
        : E
      : InvalidResultError
  : InvalidResultError;

/** Resolves a failure to its exact error type when its code is valid. */
type ValidatedFailure<E, M> = E extends ResultError
  ? string extends E["code"]
    ? Failure<MapperError<M>>
    : Failure<E>
  : Failure<MapperError<M>>;

/** Computes the result union from the operation return type and mapper. */
export type TryResultOutput<T, M> = [T] extends [never]
  ? Failure<MapperError<M>>
  : T extends Failure<infer E>
    ? ValidatedFailure<E, M>
    : T extends ResultError
      ? ValidatedFailure<T, M>
      : T extends Error
        ? Failure<MapperError<M>>
        : Normalize<T> extends infer N
          ? N extends Failure<infer E>
            ? ValidatedFailure<E, M>
            : N | Failure<MapperError<M>>
          : never;
