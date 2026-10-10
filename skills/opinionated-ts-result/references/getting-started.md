# Getting Started

`@opinionated-ts/result` represents operation outcomes as typed values. TypeScript can infer the success type and the concrete failure types from the values returned by an operation.

## Install

```bash
bun add @opinionated-ts/result

# pnpm add @opinionated-ts/result
# yarn add @opinionated-ts/result
# npm install @opinionated-ts/result
```

## Create a Result

Use `ok()` for a success and `error()` for a failure:

```ts
import { error, ok } from "@opinionated-ts/result";

type User = { id: string; blocked: boolean };

class UserBlockedError extends Error {
  readonly code = "BLOCKED";
}

function validateUser(user: User) {
  if (user.blocked) return error(new UserBlockedError());
  return ok(user);
}
```

No explicit `Result<User, UserBlockedError>` annotation is needed. The returned branches determine the inferred contract.

## Define typed failures with literal codes

```ts
class UserNotFoundError extends Error {
  readonly code = "NOT_FOUND";
}

error(new UserNotFoundError()); // valid typed failure
```

A typed failure passed directly to `error()` must extend `Error` and have a string-literal `code`. A widened `string` is rejected by TypeScript because it loses the exact discriminator:

```ts
class UserError extends Error {
  readonly code: string;
  constructor(code: string) {
    super();
    this.code = code;
  }
}

// TypeScript error: the code type is too broad.
error(new UserError("NOT_FOUND"));
```

Prefer `readonly code = "NOT_FOUND"` or a generic error class whose type parameter preserves the literal code. See [constructors and runtime behavior](./results.md#typescript-and-runtime-are-not-identical) for why this static requirement differs from runtime validation.

## Consume a Result

```ts
import { isSuccess } from "@opinionated-ts/result";

const result = validateUser(user);

if (isSuccess(result)) {
  return result.value;
}

return handleError(result.error);
```

The complementary `isFailure()` guard narrows to the failure branch. The discriminant `ok` can also be checked directly.

## Return expected failures; do not throw them

A function's TypeScript return type does not describe values thrown with `throw`. If an expected failure is thrown, callers cannot discover it through the function's inferred return contract. Prefer returning `error(new SpecificError())` for expected failures.

When a dependency may throw, use `tryResult()` or `tryResultAsync()` to catch the cause and map it to an operation-specific error:

```ts
import { tryResultAsync } from "@opinionated-ts/result";

class UserLoadFailedError extends Error {
  readonly code = "LOAD_FAILED";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

// oxfmt-ignore
const result = await tryResultAsync(() => {
    // Additional preparation can go here.
    return database.findUser(id);
  },
  (cause) => new UserLoadFailedError("Could not load user.", { cause }),
);
```

The mapper receives `unknown`; preserve that boundary and do not assume the cause is an `Error` without narrowing it. If no valid mapper error is produced, the `try` helpers use `InvalidResultError`. Full behavior and options are covered in [Try Results](./try-results.md).

## Next steps

- [Result constructors and runtime behavior](./results.md) — constructor differences, normalization, and edge cases.
- [Try Results](./try-results.md) — synchronous/asynchronous exception handling and stack inheritance.
- [Error Flow](./error-flow.md) — compose results, propagate failures, and translate only when needed.
