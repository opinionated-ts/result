import type { NonNullish } from "@/try";

import { error, ok, tryResult, tryResultAsync, type Failure, type Success } from "@/index";

type DefaultFailure = Failure<NonNullish>;

class DatabaseError extends Error {}
class UserLoadFailedError extends Error {}

const returnedSuccess: Success<string> | DefaultFailure = tryResult(() => ok("loaded"));

const returnedFailure: Failure<string> | DefaultFailure = tryResult(() => error("not found"));

const nestedSuccess: Success<string> | DefaultFailure = tryResult(() => ok(ok("loaded")));

const syncPromise: Success<Promise<number>> | DefaultFailure = tryResult(() => Promise.resolve(42));

const thrownFailure: Failure<DatabaseError> = tryResult(
  () => {
    throw new UserLoadFailedError("not found");
  },
  () => new DatabaseError(),
);

const mappedError: Failure<UserLoadFailedError> = tryResult(
  () => {
    throw new DatabaseError();
  },
  (cause) => new UserLoadFailedError("load failed", { cause }),
);

const thrownString: Success<number> | DefaultFailure = tryResult(() => {
  throw "FAILED";
});

const valueWithMapper: Success<number> | Failure<UserLoadFailedError> = tryResult(
  () => 42,
  () => new UserLoadFailedError("load failed"),
);

const invalidMapper = tryResult(
  () => {
    throw new DatabaseError();
  },
  // @ts-expect-error - Mapper must return a non-nullish failure value.
  () => null,
);

const asyncMappedError: Promise<Success<number> | Failure<UserLoadFailedError>> = tryResultAsync(
  async () => {
    throw new DatabaseError();
  },
  (cause) => new UserLoadFailedError("load failed", { cause }),
);

const asyncThrownString: Promise<Success<number> | DefaultFailure> = tryResultAsync(async () => {
  throw "FAILED";
});

void [
  returnedSuccess,
  returnedFailure,
  nestedSuccess,
  syncPromise,
  thrownFailure,
  mappedError,
  thrownString,
  valueWithMapper,
  invalidMapper,
  asyncMappedError,
  asyncThrownString,
];
