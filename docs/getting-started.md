# Getting Started

`@opinionated-ts/result` makes operation outcomes explicit as typed values.

The key benefit is the contract visible to the caller: **TypeScript can infer the exact success type and the exact failure types a function can return.**

That means callers do not have to read the implementation to discover which expected failures they need to handle.

## Install

Install with your preferred package manager:

```bash
bun add @opinionated-ts/result

# pnpm add @opinionated-ts/result
# yarn add @opinionated-ts/result
# npm install @opinionated-ts/result
```

## Create a Result

A `Result` represents the outcome of an operation: either a success value or a failure error.

Use `ok()` for success and `error()` for failure:

```ts
import { error, ok } from "@opinionated-ts/result";

type User = {
  id: string;
  blocked: boolean;
};

class UserBlockedError extends Error {
  readonly code = "BLOCKED";
}

function validateUser(user: User) {
  if (user.blocked) {
    return error(new UserBlockedError());
  }

  return ok(user);
}
```

## Define typed failures

Failures passed to `error()` must be `Error` values with an explicitly typed, literal `code`. This preserves the exact failure discriminator:

```ts
class UserNotFoundError extends Error {
  readonly code = "NOT_FOUND";
}

class UserError extends Error {
  readonly code: string;

  constructor(code: string) {
    super();
    this.code = code;
  }
}

error(new UserNotFoundError()); // valid
error(new UserError("NOT_FOUND")); // TypeScript error
```

A widened `string` code is rejected because TypeScript can no longer determine the exact failure type. The diagnostic uses `ErrorCodeMustBeLiteralString` to indicate that the error code must remain literal.

## Consume a Result

Use the exported guards to narrow the result:

```ts
import { isFailure, isSuccess } from "@opinionated-ts/result";

const result = validateUser(user);

if (isSuccess(result)) {
  return result.value;
}

return handleError(result.error);
```

`isSuccess()` narrows to the success branch, while `isFailure()` narrows to the failure branch.

## Keep failures inside the contract

For a function that returns `Result`, expected operation failures should be returned rather than thrown.

When code called by the operation may throw, catch it and translate the cause into a concrete typed error:

```ts
class UserLoadFailedError extends Error {
  readonly code = "LOAD_FAILED";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

async function loadUser(id: string) {
  try {
    const user = await database.findUser(id);

    if (!user) {
      return error(new UserNotFoundError());
    }

    return ok(user);
  } catch (cause) {
    return error(new UserLoadFailedError("Could not load user.", { cause }));
  }
}
```

Do not expose the generic caught value as the operation's expected failure:

```ts
try {
  // ...
} catch (cause) {
  return error(cause);
}
```

Translate caught values into the specific typed error that callers should handle. This keeps the inferred failure union concrete and meaningful.

At runtime, `error()` preserves existing `Failure` and `Error` values. Non-`Error` values are wrapped in `InvalidResultError`, with the original value preserved as its `cause`.

## Next steps

- [Error Flow](./error-flow.md) — compose results across functions without losing their concrete failure types.
