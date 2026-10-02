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

Both `ok()` and `error()` create `Result` values. TypeScript infers the concrete success and failure types from the values returned by the function.

Internally, a `Result` has two possible shapes:

```ts
type Result<T, E extends Error = Error> = { ok: true; value: T } | { ok: false; error: E };
```

You do not need to learn or use this type directly. It simply describes the mechanism that gives `Result` its type-safe behavior.

For example, the `validateUser()` function above is inferred as a result with two possible outcomes:

```ts
{
  ok: true;
  value: User;
}
```

or:

```ts
{
  ok: false;
  error: UserBlockedError;
}
```

The value passed to `ok()` determines the success type, while the value passed to `error()` determines the failure type. TypeScript combines those possibilities automatically into the function's return type.

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

`isSuccess()` narrows to the success branch and `isFailure()` narrows to the failure branch.

## Keep failures inside the contract

For a function that returns `Result`, operation failures should be returned rather than thrown. When code called by the operation may throw, catch it and translate the cause into a concrete error:

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

Do not expose the generic caught value as part of the function's failure contract:

```ts
try {
  // ...
} catch (cause) {
  return error(cause);
}
```

Translate it into the specific failure that callers need to handle. This keeps the inferred error union concrete instead of widening it to an unknown or generic error.

## Next steps

- [Error Flow](./error-flow.md) — compose results across functions without losing their concrete failure types.
