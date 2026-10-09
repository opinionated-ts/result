import type { InvalidResultError } from "@/errors/invalid-result";
import type { Failure, Normalize, ResultError } from "@/types";

/** Configuration shared by {@link tryResult} and {@link tryResultAsync}. */
export interface TryResultOptions {
  /** When true, errors inherit the stack from the cause used to create them. Defaults to true. */
  readonly inheritStack?: boolean;
}

/** Converts an unknown failure cause into a candidate result error. */
export type Mapper = (cause: unknown) => unknown;

/** Infers the mapper's valid error type, falling back to {@link InvalidResultError}. */
export type MapperError<M> = M extends (cause: unknown) => infer E
  ? [E] extends [never]
    ? InvalidResultError
    : E extends ResultError
      ? string extends E["code"]
        ? ResultError
        : E
      : InvalidResultError
  : InvalidResultError;

/** Computes the result union from the operation return type and mapper. */
export type TryResultOutput<T, M> = [T] extends [never]
  ? Failure<MapperError<M>>
  : T extends Failure<infer E>
    ? E extends ResultError
      ? Failure<E>
      : Failure<MapperError<M>>
    : T extends ResultError
      ? string extends T["code"]
        ? Failure<ResultError>
        : Failure<T>
      : T extends Error
        ? Failure<MapperError<M>>
        : Normalize<T> extends infer N
          ? N extends Failure<infer E>
            ? E extends ResultError
              ? Failure<E>
              : Failure<MapperError<M>>
            : N | Failure<MapperError<M>>
          : never;
