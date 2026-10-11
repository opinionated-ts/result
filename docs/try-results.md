# Try Helpers

`tryResult()` and `tryResultAsync()` adapt exception-based operations to the package's `Result` contract. They normalize successful return values and convert caught or rejected values into failures.

## Without a mapper

When the operation throws or rejects a non-nullish value, the helper preserves that value as the failure without requiring it to be an `Error` or expose a `code`:

```ts
const result = tryResult(() => {
  throw "connection refused";
});

// Failure containing "connection refused"
```

`null` and `undefined` cannot be represented as failure values. If either is thrown or used to reject without a mapper, the helper throws `NullishFailureError`, preserving the original value as `cause`.

## Translate a caught value

Pass a mapper when the operation's failure should be represented by a specific error or another concrete, non-nullish value:

```ts
const result = tryResult(
  () => database.findUser(id),
  (cause) => new UserLoadFailedError("Could not load user.", { cause }),
);
```

The mapper receives the original caught or rejected value as `unknown`. Its return value is passed to `error()`: a normal value becomes a failure, while a value that is already a `Failure` is returned unchanged. If the mapper throws, that exception propagates normally.

TypeScript enforces the non-nullish mapper return contract; the helper does not add runtime validation for values that violate the type contract through untyped code or unsafe casts.

`tryResultAsync()` follows the same rules for asynchronous operations:

```ts
const result = await tryResultAsync(
  () => fetchUser(id),
  (cause) => new UserLoadFailedError("Could not load user.", { cause }),
);
```

## Stack traces

By default, when both the caught value and the mapped value are `Error` instances and the original error has a stack, the helper copies the original stack to the mapped error. Pass `{ inheritStack: false }` as the third argument to disable this behavior.

## Choose the right API

- Use `ok()` and `error()` when the operation already knows its outcome and concrete failure.
- Use `tryResult()` or `tryResultAsync()` to adapt an operation that can throw or reject.
- Provide a mapper when the caught value must be translated into the failure contract callers should handle.
