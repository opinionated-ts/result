import {
  failure,
  InvalidResultError,
  isFailure,
  success,
  tryResult,
  type Failure,
  type Success,
} from "@/index";

class DatabaseError extends Error {
  readonly code = "DATABASE_ERROR" as const;
}

class UserLoadFailedError extends Error {
  readonly code = "USER_LOAD_FAILED" as const;
}

const plainValue: Success<number> | Failure<InvalidResultError> = tryResult(() => 42);

const returnedSuccess: Success<string> | Failure<InvalidResultError> = tryResult(() =>
  success("loaded"),
);

const nestedSuccess: Success<string> | Failure<InvalidResultError> = tryResult(() =>
  success(success("loaded")),
);

const returnedFailure: Failure<UserLoadFailedError> = tryResult(() =>
  failure(new UserLoadFailedError("not found")),
);

const returnedFailureWithMapper: Failure<UserLoadFailedError> = tryResult(
  () => failure(new UserLoadFailedError("not found")),
  () => new DatabaseError(),
);

const syncPromise: Success<Promise<number>> | Failure<InvalidResultError> = tryResult(() =>
  Promise.resolve(42),
);

const thrownFailure: Failure<DatabaseError> = tryResult(
  () => {
    throw failure(new UserLoadFailedError("not found"));
  },
  () => new DatabaseError(),
);

const mappedError: Failure<UserLoadFailedError> = tryResult(
  () => {
    throw new DatabaseError();
  },
  (cause) => new UserLoadFailedError("asd", { cause }),
);

const thrownString: Failure<InvalidResultError> = tryResult(() => {
  throw "FAILED";
});

const valueWithMapper: Success<number> | Failure<UserLoadFailedError> = tryResult(
  () => 42,
  () => new UserLoadFailedError("load failed"),
);

const invalidReturnedFailureWithMapper: Failure<UserLoadFailedError> = tryResult(
  () => failure(new Error("invalid failure")),
  () => new UserLoadFailedError("load failed"),
);

const invalidReturnedFailure: Failure<InvalidResultError> = tryResult(() =>
  failure(new Error("invalid failure")),
);

const directResultError: Failure<DatabaseError> = tryResult(
  () => new DatabaseError(),
  () => new UserLoadFailedError("unused mapper"),
);
const directInvalidError: Failure<UserLoadFailedError> = tryResult(
  () => new Error("invalid error"),
  () => new UserLoadFailedError("load failed"),
);

const invalidMapper: Failure<InvalidResultError> = tryResult(
  () => {
    throw new DatabaseError();
  },
  () => "not an error",
);

for (const [name, value] of Object.entries({
  plainValue,
  returnedSuccess,
  nestedSuccess,
  returnedFailure,
  returnedFailureWithMapper,
  syncPromise,
  thrownFailure,
  mappedError,
  thrownString,
  valueWithMapper,
  invalidReturnedFailureWithMapper,
  invalidReturnedFailure,
  directResultError,
  directInvalidError,
  invalidMapper,
})) {
  if (isFailure(value)) console.log(name, value.error);
  else console.log(name, value.value);
}
